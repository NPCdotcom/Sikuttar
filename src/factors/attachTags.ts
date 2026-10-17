/**
 * Attach classification tags to a story (E10). Creates tag rows as needed.
 */
export async function attachTags(
  db: D1Database,
  storyId: string,
  tags: string[],
): Promise<void> {
  if (tags.length === 0) return;

  const statements: D1PreparedStatement[] = [];
  for (const name of tags) {
    statements.push(
      db
        .prepare(`INSERT OR IGNORE INTO tags (id, name) VALUES (?, ?)`)
        .bind(crypto.randomUUID(), name),
    );
    statements.push(
      db
        .prepare(
          `INSERT OR IGNORE INTO story_tags (story_id, tag_id)
           SELECT ?, id FROM tags WHERE name = ?`,
        )
        .bind(storyId, name),
    );
  }
  await db.batch(statements);
}
