import type { StoryRow } from "./listByCreatedAtDesc";

/** Stories authored by author_key, newest first (profile · not public identity). */
export async function listMyStories(
  db: D1Database,
  authorKey: string,
  limit = 50,
): Promise<StoryRow[]> {
  const result = await db
    .prepare(
      `SELECT id, body, situation, cause, created_at, author_key
       FROM failure_stories
       WHERE author_key = ?
       ORDER BY created_at DESC
       LIMIT ?`,
    )
    .bind(authorKey, limit)
    .all<StoryRow>();

  return result.results ?? [];
}
