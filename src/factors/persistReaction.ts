import type { ReactionKind } from "./validateReactionKind";

export type PersistedReaction = {
  id: string;
  storyId: string;
  kind: ReactionKind;
  createdAt: string;
};

export class ReactionConflictError extends Error {
  constructor(message = "reaction already exists") {
    super(message);
    this.name = "ReactionConflictError";
  }
}

export class StoryNotFoundError extends Error {
  constructor(message = "story not found") {
    super(message);
    this.name = "StoryNotFoundError";
  }
}

export async function persistReaction(
  db: D1Database,
  storyId: string,
  authorKey: string,
  kind: ReactionKind,
): Promise<PersistedReaction> {
  const story = await db
    .prepare("SELECT id FROM failure_stories WHERE id = ?")
    .bind(storyId)
    .first<{ id: string }>();
  if (!story) {
    throw new StoryNotFoundError();
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  try {
    await db
      .prepare(
        `INSERT INTO reactions (id, story_id, author_key, kind, created_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(id, storyId, authorKey, kind, createdAt)
      .run();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/UNIQUE|unique/i.test(msg)) {
      throw new ReactionConflictError();
    }
    throw err;
  }

  return { id, storyId, kind, createdAt };
}
