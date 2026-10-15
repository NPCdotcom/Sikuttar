import { Hono } from "hono";
import { attachAuthorKey } from "./factors/attachAuthorKey";
import { anonymizeForDisplay } from "./factors/anonymizeForDisplay";
import {
  countPublicReactions,
  maskBadFromPublic,
} from "./factors/countPublicReactions";
import { ensureAccountSlot } from "./factors/ensureAccountSlot";
import { listByCreatedAtDesc } from "./factors/listByCreatedAtDesc";
import {
  persistReaction,
  ReactionConflictError,
  StoryNotFoundError,
} from "./factors/persistReaction";
import { persistFailureStory } from "./factors/persistFailureStory";
import { ValidationError, validateBody } from "./factors/validateBody";
import {
  ReactionValidationError,
  validateReactionKind,
} from "./factors/validateReactionKind";
import type { Env } from "./env";

const app = new Hono<{ Bindings: Env }>();

app.get("/health", async (c) => {
  await c.env.DB.prepare("SELECT 1 AS ok").first();
  return c.json({ ok: true });
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
