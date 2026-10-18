export type TopicTag = {
  name: string;
  count: number;
};

/**
 * Top classification tags for stories created at/after `sinceIso`.
 */
export async function listTopicTags(
  db: D1Database,
  sinceIso: string,
  limit = 5,
): Promise<TopicTag[]> {
  const result = await db
    .prepare(
      `SELECT t.name AS name, COUNT(*) AS cnt
       FROM tags AS t
       INNER JOIN story_tags AS st ON st.tag_id = t.id
       INNER JOIN failure_stories AS s ON s.id = st.story_id
       WHERE s.created_at >= ?
       GROUP BY t.id
       ORDER BY cnt DESC, t.name COLLATE NOCASE ASC
       LIMIT ?`,
    )
    .bind(sinceIso, limit)
    .all<{ name: string; cnt: number }>();

  return (result.results ?? []).map((row) => ({
    name: row.name,
    count: Number(row.cnt),
  }));
}

export function hoursAgoIso(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

export function daysAgoIso(days: number): string {
  return hoursAgoIso(days * 24);
}
