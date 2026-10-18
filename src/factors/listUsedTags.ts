/**
 * Tags that appear on at least one story, ordered by usage then name.
 * Feed filter chips use this (variable hashtag-style), not a fixed vocabulary.
 */
export async function listUsedTags(
  db: D1Database,
  limit = 40,
): Promise<string[]> {
  const result = await db
    .prepare(
      `SELECT t.name AS name, COUNT(*) AS cnt
       FROM tags AS t
       INNER JOIN story_tags AS st ON st.tag_id = t.id
       GROUP BY t.id
       ORDER BY cnt DESC, t.name COLLATE NOCASE ASC
       LIMIT ?`,
    )
    .bind(limit)
    .all<{ name: string }>();
  return (result.results ?? []).map((row) => row.name);
}
