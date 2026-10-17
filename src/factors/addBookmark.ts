import { StoryNotFoundError } from "./persistReaction";

export type Bookmarked = {
  storyId: string;
  createdAt: string;
};

/** Idempotent: existing bookmark returns the same shape without error. */
export async function addBookmark(
  db: D1Database,
  authorKey: string,
  storyId: string,
): Promise<Bookmarked> {
  const story = await db
    .prepare("SELECT id FROM failure_stories WHERE id = ?")
    .bind(storyId)
    .first<{ id: string }>();
  if (!story) {
    throw new StoryNotFoundError();
  }

  const existing = await db
    .prepare(
      `SELECT created_at AS createdAt FROM bookmarks
       WHERE author_key = ? AND story_id = ?`,
    )
    .bind(authorKey, storyId)
    .first<{ createdAt: string }>();
  if (existing) {
    return { storyId, createdAt: existing.createdAt };
  }

  const createdAt = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO bookmarks (author_key, story_id, created_at)
       VALUES (?, ?, ?)`,
    )
    .bind(authorKey, storyId, createdAt)
    .run();

  return { storyId, createdAt };
}
