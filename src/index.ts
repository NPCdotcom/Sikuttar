import { Hono } from "hono";
import { attachAuthorKey } from "./factors/attachAuthorKey";
import { anonymizeForDisplay } from "./factors/anonymizeForDisplay";
import { ensureAccountSlot } from "./factors/ensureAccountSlot";
import { listByCreatedAtDesc } from "./factors/listByCreatedAtDesc";
import { persistFailureStory } from "./factors/persistFailureStory";
import { ValidationError, validateBody } from "./factors/validateBody";
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
  const items = rows.map(anonymizeForDisplay);
  return c.json({ items });
});

export default app;
