import { Hono } from "hono";
import {
  attachAuthorKey,
  authorKeySetCookie,
  createAuthorKey,
} from "./factors/attachAuthorKey";
import { addBookmark } from "./factors/addBookmark";
import { anonymizeForDisplay } from "./factors/anonymizeForDisplay";
import { attachTags } from "./factors/attachTags";
import {
  countPublicReactions,
  maskBadFromPublic,
} from "./factors/countPublicReactions";
import { ensureAccountSlot } from "./factors/ensureAccountSlot";
import {
  buildGitHubAuthorizeUrl,
  exchangeGitHubCodeForSubject,
  GitHubOAuthError,
} from "./factors/exchangeGitHubOAuth";
import { findRelatedStories } from "./factors/findRelatedStories";
import {
  accountHasSubject,
  linkAuthSubject,
} from "./factors/linkAuthSubject";
import { listBookmarks } from "./factors/listBookmarks";
import { listByCreatedAtDesc } from "./factors/listByCreatedAtDesc";
import { listMyStories } from "./factors/listMyStories";
import type { StoryRow } from "./factors/listByCreatedAtDesc";
import { listByTag } from "./factors/listByTag";
import { listRecommendedTags } from "./factors/listRecommendedTags";
import { listUsedTags } from "./factors/listUsedTags";
import {
  deleteOwnStory,
  StoryForbiddenError,
} from "./factors/deleteOwnStory";
import { dashboardStats } from "./factors/dashboardStats";
import {
  daysAgoIso,
  hoursAgoIso,
  listTopicTags,
} from "./factors/listTopicTags";
import { loadTagsByStoryIds } from "./factors/loadTagsByStoryIds";
import {
  createOAuthState,
  oauthStateClearCookie,
  oauthStateSetCookie,
  readOAuthStateFromCookie,
} from "./factors/oauthStateCookie";
import {
  persistReaction,
  ReactionConflictError,
  StoryNotFoundError,
} from "./factors/persistReaction";
import { persistFailureStory } from "./factors/persistFailureStory";
import {
  MissingOAuthConfigError,
  oauthSuccessRedirect,
  readGitHubOAuthConfig,
} from "./factors/readGitHubOAuthConfig";
import { removeBookmark } from "./factors/removeBookmark";
import {
  requireLinkedAuthorKey,
  UnauthorizedError,
} from "./factors/requireLinkedAuthorKey";
import { askSecretary } from "./factors/askSecretary";
import { searchStories } from "./factors/searchStories";
import { secretaryQaEnabled } from "./factors/secretaryQaEnabled";
import { updateAccountAttributes } from "./factors/updateAccountAttributes";
import { upsertStoryEmbedding } from "./factors/upsertStoryEmbedding";
import { validateAccountAttributes } from "./factors/validateAccountAttributes";
import { ValidationError, validateBody } from "./factors/validateBody";
import {
  ReactionValidationError,
  validateReactionKind,
} from "./factors/validateReactionKind";
import type { Env } from "./env";

const app = new Hono<{ Bindings: Env }>();

function redirectWithCookies(location: string, cookies: string[]): Response {
  const headers = new Headers({ Location: location });
  for (const cookie of cookies) {
    headers.append("Set-Cookie", cookie);
  }
  return new Response(null, { status: 302, headers });
}

function jsonWithCookies(
  body: unknown,
  status: number,
  cookies: string[],
): Response {
  const headers = new Headers({ "Content-Type": "application/json" });
  for (const cookie of cookies) {
    headers.append("Set-Cookie", cookie);
  }
  return new Response(JSON.stringify(body), { status, headers });
}

async function toPublicItems(db: D1Database, rows: StoryRow[]) {
  const ids = rows.map((r) => r.id);
  const countsMap = await countPublicReactions(db, ids);
  const tagsMap = await loadTagsByStoryIds(db, ids);
  return rows.map((row) => {
    const base = anonymizeForDisplay(row);
    const counts = maskBadFromPublic(
      countsMap.get(row.id) ?? { wakaru: 0, reference: 0 },
    );
    return {
      ...base,
      counts,
      tags: tagsMap.get(row.id) ?? [],
    };
  });
}

app.get("/health", async (c) => {
  await c.env.DB.prepare("SELECT 1 AS ok").first();
  return c.json({ ok: true });
});

/** Dashboard aggregates (counts · topic windows · recent stories). */
app.get("/dashboard", async (c) => {
  const [stats, day, week, month, recentRows] = await Promise.all([
    dashboardStats(c.env.DB),
    listTopicTags(c.env.DB, hoursAgoIso(24), 5),
    listTopicTags(c.env.DB, daysAgoIso(7), 5),
    listTopicTags(c.env.DB, daysAgoIso(30), 5),
    listByCreatedAtDesc(c.env.DB, 5),
  ]);
  const recent = await toPublicItems(c.env.DB, recentRows);
  return c.json({
    stats,
    recent,
    topics: { day, week, month },
  });
});


/** Login start — redirects to GitHub (IdP details stay server-side). */
app.get("/auth/github", async (c) => {
  let config;
  try {
    config = readGitHubOAuthConfig(c.env);
  } catch (err) {
    if (err instanceof MissingOAuthConfigError) {
      return c.json({ error: err.message }, 503);
    }
    throw err;
  }
  const state = createOAuthState();
  const url = buildGitHubAuthorizeUrl(config, state);
  const cookies: string[] = [oauthStateSetCookie(state)];
  const { authorKey, setCookie } = attachAuthorKey(c.req.header("Cookie"));
  await ensureAccountSlot(c.env.DB, authorKey);
  if (setCookie) {
    cookies.push(setCookie);
  }
  return redirectWithCookies(url, cookies);
});

app.get("/auth/github/callback", async (c) => {
  let config;
  try {
    config = readGitHubOAuthConfig(c.env);
  } catch (err) {
    if (err instanceof MissingOAuthConfigError) {
      return c.json({ error: err.message }, 503);
    }
    throw err;
  }

  const code = c.req.query("code");
  const state = c.req.query("state");
  const expected = readOAuthStateFromCookie(c.req.header("Cookie"));
  const cookies: string[] = [oauthStateClearCookie()];

  if (!code || !state || !expected || state !== expected) {
    return jsonWithCookies({ error: "invalid OAuth state" }, 400, cookies);
  }

  const { authorKey: cookieKey, setCookie } = attachAuthorKey(
    c.req.header("Cookie"),
  );
  if (setCookie) {
    cookies.push(setCookie);
  }

  let subject: string;
  try {
    subject = await exchangeGitHubCodeForSubject(config, code);
  } catch (err) {
    if (err instanceof GitHubOAuthError) {
      return jsonWithCookies({ error: err.message }, 502, cookies);
    }
    throw err;
  }

  const linked = await linkAuthSubject(c.env.DB, subject, cookieKey);
  cookies.push(authorKeySetCookie(linked.authorKey));
  return redirectWithCookies(oauthSuccessRedirect(c.env), cookies);
});

/** End session; does not unlink auth_subject from the account row. */
app.post("/auth/logout", async (c) => {
  const fresh = createAuthorKey();
  await ensureAccountSlot(c.env.DB, fresh);
  return jsonWithCookies({ ok: true, loggedIn: false }, 200, [
    authorKeySetCookie(fresh),
    oauthStateClearCookie(),
  ]);
});

/** Session probe for FE — no IdP identifiers in the body. */
app.get("/auth/session", async (c) => {
  const { authorKey, setCookie } = attachAuthorKey(c.req.header("Cookie"));
  const cookies: string[] = [];
  if (setCookie) {
    cookies.push(setCookie);
  }
  await ensureAccountSlot(c.env.DB, authorKey);
  const loggedIn = await accountHasSubject(c.env.DB, authorKey);
  if (cookies.length === 0) {
    return c.json({ loggedIn });
  }
  return jsonWithCookies({ loggedIn }, 200, cookies);
});

app.get("/tags/recommended", (c) => {
  return c.json({ items: listRecommendedTags() });
});

/** Tags actually used on stories (feed filter · hashtag-style). */
app.get("/tags", async (c) => {
  const items = await listUsedTags(c.env.DB);
  return c.json({ items });
});

/** Free-text semantic search (Vectorize when bound, else Jaccard). */
app.get("/search", async (c) => {
  const q = c.req.query("q")?.trim() ?? "";
  const rows = await searchStories(c.env, q, 20);
  const items = await toPublicItems(c.env.DB, rows);
  return c.json({ items });
});

/** E12 secretary inquiry — template answer (ADR 0002). Gated by SECRETARY_QA. */
app.post("/assistant/ask", async (c) => {
  if (!secretaryQaEnabled(c.env)) {
    return c.json({ error: "secretary disabled" }, 404);
  }

  let payload: unknown;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: "invalid JSON" }, 400);
  }

  if (!payload || typeof payload !== "object") {
    return c.json({ error: "invalid body" }, 400);
  }
  const body = payload as Record<string, unknown>;
  const question = typeof body.question === "string" ? body.question : "";
  const seedStoryId =
    typeof body.seed_story_id === "string" ? body.seed_story_id : undefined;
  if (!question.trim()) {
    return c.json({ error: "question required" }, 400);
  }

  const result = await askSecretary(c.env, question, {
    seedStoryId,
    cookieHeader: c.req.header("Cookie"),
  });
  return c.json(result);
});

/** Internal attributes only — never returned on public story JSON (FR13). */
app.patch("/me/attributes", async (c) => {
  let linked;
  try {
    linked = await requireLinkedAuthorKey(c.env.DB, c.req.header("Cookie"));
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return c.json({ error: err.message }, 401);
    }
    throw err;
  }

  let payload: unknown;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: "invalid JSON" }, 400);
  }

  let patch;
  try {
    patch = validateAccountAttributes(payload);
  } catch (err) {
    if (err instanceof ValidationError) {
      return c.json({ error: err.message }, 400);
    }
    throw err;
  }

  const updated = await updateAccountAttributes(
    c.env.DB,
    linked.authorKey,
    patch,
  );
  if (linked.setCookie) {
    c.header("Set-Cookie", linked.setCookie);
  }
  if (!updated) {
    return c.json({ error: "account not linked or nothing to update" }, 404);
  }
  return c.body(null, 204);
});

app.get("/me/bookmarks", async (c) => {
  let linked;
  try {
    linked = await requireLinkedAuthorKey(c.env.DB, c.req.header("Cookie"));
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return c.json({ error: err.message }, 401);
    }
    throw err;
  }
  const rows = await listBookmarks(c.env.DB, linked.authorKey, 50);
  const items = await toPublicItems(c.env.DB, rows);
  if (linked.setCookie) {
    c.header("Set-Cookie", linked.setCookie);
  }
  return c.json({ items });
});

/** Own posts for private profile (FR13: public JSON still anonymized). */
app.get("/me/stories", async (c) => {
  let linked;
  try {
    linked = await requireLinkedAuthorKey(c.env.DB, c.req.header("Cookie"));
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return c.json({ error: err.message }, 401);
    }
    throw err;
  }
  const rows = await listMyStories(c.env.DB, linked.authorKey, 50);
  const items = await toPublicItems(c.env.DB, rows);
  if (linked.setCookie) {
    c.header("Set-Cookie", linked.setCookie);
  }
  return c.json({ items });
});

app.post("/stories", async (c) => {
  let payload: unknown;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: "invalid JSON" }, 400);
  }

  let validated;
  try {
    validated = validateBody(payload);
  } catch (err) {
    if (err instanceof ValidationError) {
      return c.json({ error: err.message }, 400);
    }
    throw err;
  }

  const { authorKey, setCookie } = attachAuthorKey(c.req.header("Cookie"));
  await ensureAccountSlot(c.env.DB, authorKey);
  const story = await persistFailureStory(c.env.DB, validated, authorKey);
  await attachTags(c.env.DB, story.id, validated.tags);
  try {
    await upsertStoryEmbedding(c.env, {
      id: story.id,
      body: story.body,
      situation: story.situation,
      cause: story.cause,
    });
  } catch {
    // Indexing must not fail the post (NFR7 / FR12).
  }
  if (setCookie) {
    c.header("Set-Cookie", setCookie);
  }
  return c.json({ ...story, tags: validated.tags }, 201);
});

app.get("/stories", async (c) => {
  const tag = c.req.query("tag")?.trim();
  const rows = tag
    ? await listByTag(c.env.DB, tag, 50)
    : await listByCreatedAtDesc(c.env.DB, 50);
  const items = await toPublicItems(c.env.DB, rows);
  return c.json({ items });
});

/** Delete own story (author_key must match cookie). */
app.delete("/stories/:id", async (c) => {
  const storyId = c.req.param("id");
  const { authorKey, setCookie } = attachAuthorKey(c.req.header("Cookie"));
  try {
    await deleteOwnStory(c.env.DB, storyId, authorKey);
  } catch (err) {
    if (err instanceof StoryNotFoundError) {
      return c.json({ error: "not found" }, 404);
    }
    if (err instanceof StoryForbiddenError) {
      return c.json({ error: "forbidden" }, 403);
    }
    throw err;
  }
  if (setCookie) {
    c.header("Set-Cookie", setCookie);
  }
  return c.body(null, 204);
});

app.get("/stories/:id/related", async (c) => {
  const storyId = c.req.param("id");
  try {
    const hits = await findRelatedStories(c.env.DB, storyId, 3);
    const items = await toPublicItems(
      c.env.DB,
      hits.map((h) => h.row),
    );
    return c.json({ items });
  } catch (err) {
    if (err instanceof StoryNotFoundError) {
      return c.json({ error: err.message }, 404);
    }
    throw err;
  }
});

app.post("/stories/:id/bookmarks", async (c) => {
  let linked;
  try {
    linked = await requireLinkedAuthorKey(c.env.DB, c.req.header("Cookie"));
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return c.json({ error: err.message }, 401);
    }
    throw err;
  }
  try {
    const bookmarked = await addBookmark(
      c.env.DB,
      linked.authorKey,
      c.req.param("id"),
    );
    if (linked.setCookie) {
      c.header("Set-Cookie", linked.setCookie);
    }
    return c.json(bookmarked, 201);
  } catch (err) {
    if (err instanceof StoryNotFoundError) {
      return c.json({ error: err.message }, 404);
    }
    throw err;
  }
});

app.delete("/stories/:id/bookmarks", async (c) => {
  let linked;
  try {
    linked = await requireLinkedAuthorKey(c.env.DB, c.req.header("Cookie"));
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return c.json({ error: err.message }, 401);
    }
    throw err;
  }
  await removeBookmark(c.env.DB, linked.authorKey, c.req.param("id"));
  if (linked.setCookie) {
    c.header("Set-Cookie", linked.setCookie);
  }
  return c.body(null, 204);
});

app.post("/stories/:id/reactions", async (c) => {
  let payload: unknown;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: "invalid JSON" }, 400);
  }

  let kind;
  try {
    kind = validateReactionKind(payload);
  } catch (err) {
    if (err instanceof ReactionValidationError) {
      return c.json({ error: err.message }, 400);
    }
    throw err;
  }

  const storyId = c.req.param("id");
  const { authorKey, setCookie } = attachAuthorKey(c.req.header("Cookie"));
  await ensureAccountSlot(c.env.DB, authorKey);

  try {
    const reaction = await persistReaction(c.env.DB, storyId, authorKey, kind);
    if (setCookie) {
      c.header("Set-Cookie", setCookie);
    }
    return c.json(
      {
        id: reaction.id,
        storyId: reaction.storyId,
        kind: reaction.kind,
        createdAt: reaction.createdAt,
      },
      201,
    );
  } catch (err) {
    if (err instanceof StoryNotFoundError) {
      return c.json({ error: err.message }, 404);
    }
    if (err instanceof ReactionConflictError) {
      return c.json({ error: err.message }, 409);
    }
    throw err;
  }
});

/** SPA fallback via Workers Assets (same origin as API · Free deploy). */
app.all("*", async (c) => {
  if (c.env.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  return c.json({ error: "not found" }, 404);
});

export default app;
