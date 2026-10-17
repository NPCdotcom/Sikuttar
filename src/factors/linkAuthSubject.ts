import { ensureAccountSlot } from "./ensureAccountSlot";
import { migrateAuthorKey } from "./migrateAuthorKey";

export type LinkAuthResult = {
  /** author_key to set on the session cookie */
  authorKey: string;
  /** true when this subject was newly bound to the cookie account */
  createdBinding: boolean;
};

/**
 * Bind opaque auth_subject to an accounts row (FR14 / FR15).
 * - Existing subject → restore that author_key; migrate cookie account data into it
 * - New subject → stamp auth_subject onto the current cookie account
 */
export async function linkAuthSubject(
  db: D1Database,
  authSubject: string,
  cookieAuthorKey: string,
): Promise<LinkAuthResult> {
  const existing = await db
    .prepare(
      `SELECT author_key AS authorKey FROM accounts WHERE auth_subject = ? LIMIT 1`,
    )
    .bind(authSubject)
    .first<{ authorKey: string }>();

  if (existing?.authorKey) {
    if (existing.authorKey !== cookieAuthorKey) {
      await ensureAccountSlot(db, cookieAuthorKey);
      await migrateAuthorKey(db, cookieAuthorKey, existing.authorKey);
    }
    return { authorKey: existing.authorKey, createdBinding: false };
  }

  await ensureAccountSlot(db, cookieAuthorKey);

  const alreadyBound = await db
    .prepare(
      `SELECT auth_subject AS authSubject FROM accounts WHERE author_key = ? LIMIT 1`,
    )
    .bind(cookieAuthorKey)
    .first<{ authSubject: string | null }>();

  if (alreadyBound?.authSubject && alreadyBound.authSubject !== authSubject) {
    // Cookie account already linked to another subject — create a fresh row
    const freshKey = crypto.randomUUID();
    await ensureAccountSlot(db, freshKey);
    await db
      .prepare(`UPDATE accounts SET auth_subject = ? WHERE author_key = ?`)
      .bind(authSubject, freshKey)
      .run();
    await migrateAuthorKey(db, cookieAuthorKey, freshKey);
    return { authorKey: freshKey, createdBinding: true };
  }

  await db
    .prepare(`UPDATE accounts SET auth_subject = ? WHERE author_key = ?`)
    .bind(authSubject, cookieAuthorKey)
    .run();

  return { authorKey: cookieAuthorKey, createdBinding: true };
}

export async function findAuthorKeyBySubject(
  db: D1Database,
  authSubject: string,
): Promise<string | null> {
  const row = await db
    .prepare(
      `SELECT author_key AS authorKey FROM accounts WHERE auth_subject = ? LIMIT 1`,
    )
    .bind(authSubject)
    .first<{ authorKey: string }>();
  return row?.authorKey ?? null;
}

export async function accountHasSubject(
  db: D1Database,
  authorKey: string,
): Promise<boolean> {
  const row = await db
    .prepare(
      `SELECT auth_subject AS authSubject FROM accounts WHERE author_key = ? LIMIT 1`,
    )
    .bind(authorKey)
    .first<{ authSubject: string | null }>();
  return Boolean(row?.authSubject);
}
