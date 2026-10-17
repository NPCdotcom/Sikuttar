/**
 * Move stories and reactions from a transient anonymous author_key onto the
 * durable account key (FR15). No-op when keys are equal.
 */
export async function migrateAuthorKey(
  db: D1Database,
  fromAuthorKey: string,
  toAuthorKey: string,
): Promise<void> {
  if (fromAuthorKey === toAuthorKey) return;

  await db
    .prepare(`UPDATE failure_stories SET author_key = ? WHERE author_key = ?`)
    .bind(toAuthorKey, fromAuthorKey)
    .run();

  // Drop source reactions that would violate UNIQUE (story_id, author_key, kind)
  await db
    .prepare(
      `DELETE FROM reactions
       WHERE author_key = ?
         AND EXISTS (
           SELECT 1 FROM reactions AS other
           WHERE other.author_key = ?
             AND other.story_id = reactions.story_id
             AND other.kind = reactions.kind
         )`,
    )
    .bind(fromAuthorKey, toAuthorKey)
    .run();

  await db
    .prepare(`UPDATE reactions SET author_key = ? WHERE author_key = ?`)
    .bind(toAuthorKey, fromAuthorKey)
    .run();

  await db
    .prepare(`DELETE FROM accounts WHERE author_key = ?`)
    .bind(fromAuthorKey)
    .run();
}
