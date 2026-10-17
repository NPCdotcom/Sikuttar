export async function removeBookmark(
  db: D1Database,
  authorKey: string,
  storyId: string,
): Promise<boolean> {
  const result = await db
    .prepare(
      `DELETE FROM bookmarks WHERE author_key = ? AND story_id = ?`,
    )
    .bind(authorKey, storyId)
    .run();
  return (result.meta.changes ?? 0) > 0;
}
