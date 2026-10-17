import type { StoryRow } from "./listByCreatedAtDesc";

/** Stories bookmarked by author_key, newest bookmark first. */
export async function listBookmarks(
  db: D1Database,
  authorKey: string,
  limit = 50,
): Promise<StoryRow[]> {
  const result = await db
    .prepare(
      `SELECT s.id, s.body, s.situation, s.cause,
              s.created_at, s.author_key
       FROM bookmarks AS b
       INNER JOIN failure_stories AS s ON s.id = b.story_id
       WHERE b.author_key = ?
       ORDER BY b.created_at DESC
       LIMIT ?`,
    )
    .bind(authorKey, limit)
    .all<StoryRow>();

  return result.results ?? [];
}
