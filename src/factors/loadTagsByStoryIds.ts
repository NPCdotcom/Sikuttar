/** Load tag names keyed by story id (for public JSON hydrate). */
export async function loadTagsByStoryIds(
  db: D1Database,
  storyIds: string[],
): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (storyIds.length === 0) return map;

  const placeholders = storyIds.map(() => "?").join(", ");
  const result = await db
    .prepare(
      `SELECT st.story_id AS storyId, t.name AS name
       FROM story_tags AS st
       INNER JOIN tags AS t ON st.tag_id = t.id
       WHERE st.story_id IN (${placeholders})
       ORDER BY t.name ASC`,
    )
    .bind(...storyIds)
    .all<{ storyId: string; name: string }>();

  for (const row of result.results ?? []) {
    const list = map.get(row.storyId) ?? [];
    list.push(row.name);
    map.set(row.storyId, list);
  }
  return map;
}
