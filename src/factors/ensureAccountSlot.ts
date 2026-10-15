/**
 * Ensure an account row exists for authorKey with empty attribute slots (FR8 / E7).
 * Does not write occupation/attributes values — NULL until a later feature fills them.
 */
export async function ensureAccountSlot(
  db: D1Database,
  authorKey: string,
): Promise<void> {
  const createdAt = new Date().toISOString();
  await db
    .prepare(
      `INSERT OR IGNORE INTO accounts (author_key, occupation, attributes_json, created_at)
       VALUES (?, NULL, NULL, ?)`,
    )
    .bind(authorKey, createdAt)
    .run();
}
