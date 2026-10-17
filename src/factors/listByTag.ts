import type { StoryRow } from "./listByCreatedAtDesc";

/** List stories that carry the given classification tag name. */
export async function listByTag(
  db: D1Database,
  tag: string,
  limit = 50,
): Promise<StoryRow[]> {
  const result = await db
    .prepare(
      `SELECT s.id, s.body, s.situation, s.cause,
              s.created_at, s.author_key
       FROM failure_stories AS s
       INNER JOIN story_tags AS st ON s.id = st.story_id
       INNER JOIN tags AS t ON st.tag_id = t.id
       WHERE t.name = ?
       ORDER BY s.created_at DESC
       LIMIT ?`,
    )
    .bind(tag, limit)
    .all<StoryRow>();

  return result.results ?? [];
}
