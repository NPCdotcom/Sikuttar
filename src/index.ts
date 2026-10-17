import { Hono } from "hono";
import {
  attachAuthorKey,
  authorKeySetCookie,
  createAuthorKey,
} from "./factors/attachAuthorKey";
import { anonymizeForDisplay } from "./factors/anonymizeForDisplay";
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
import { listByCreatedAtDesc } from "./factors/listByCreatedAtDesc";
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

app.get("/health", async (c) => {
  await c.env.DB.prepare("SELECT 1 AS ok").first();
  return c.json({ ok: true });
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
  if (setCookie) {
    c.header("Set-Cookie", setCookie);
  }
  return c.json(story, 201);
});

app.get("/stories", async (c) => {
  const rows = await listByCreatedAtDesc(c.env.DB);
  const countsMap = await countPublicReactions(
    c.env.DB,
    rows.map((r) => r.id),
  );
  const items = rows.map((row) => {
    const base = anonymizeForDisplay(row);
    const counts = maskBadFromPublic(
      countsMap.get(row.id) ?? { wakaru: 0, reference: 0 },
    );
    return { ...base, counts };
  });
  return c.json({ items });
});

app.get("/stories/:id/related", async (c) => {
  const storyId = c.req.param("id");
  try {
    const hits = await findRelatedStories(c.env.DB, storyId, 3);
    const countsMap = await countPublicReactions(
      c.env.DB,
      hits.map((h) => h.row.id),
    );
    const items = hits.map((hit) => {
      const base = anonymizeForDisplay(hit.row);
      const counts = maskBadFromPublic(
        countsMap.get(hit.row.id) ?? { wakaru: 0, reference: 0 },
      );
      return { ...base, counts };
    });
    return c.json({ items });
  } catch (err) {
    if (err instanceof StoryNotFoundError) {
      return c.json({ error: err.message }, 404);
    }
    throw err;
  }
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

export default app;
