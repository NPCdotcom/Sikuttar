import { attachAuthorKey } from "./attachAuthorKey";
import { ensureAccountSlot } from "./ensureAccountSlot";
import { accountHasSubject } from "./linkAuthSubject";

export class UnauthorizedError extends Error {
  readonly status = 401;
  constructor(message = "authentication required") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Resolve cookie author_key and require a linked OAuth subject (FR13/FR18/FR19).
 */
export async function requireLinkedAuthorKey(
  db: D1Database,
  cookieHeader: string | undefined,
): Promise<{ authorKey: string; setCookie: string | null }> {
  const { authorKey, setCookie } = attachAuthorKey(cookieHeader);
  await ensureAccountSlot(db, authorKey);
  if (!(await accountHasSubject(db, authorKey))) {
    throw new UnauthorizedError();
  }
  return { authorKey, setCookie };
}
