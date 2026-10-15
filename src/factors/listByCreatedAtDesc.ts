export type StoryRow = {
  id: string;
  body: string;
  situation: string | null;
  cause: string | null;
  created_at: string;
  author_key: string;
};

export async function listByCreatedAtDesc(
  db: D1Database,
  limit = 50,
): Promise<StoryRow[]> {
  const result = await db
    .prepare(
      `SELECT id, body, situation, cause, created_at, author_key
       FROM failure_stories
       ORDER BY created_at DESC
       LIMIT ?`,
    )
    .bind(limit)
    .all<StoryRow>();
  return result.results ?? [];
}
