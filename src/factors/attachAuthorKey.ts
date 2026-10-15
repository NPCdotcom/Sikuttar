const COOKIE_NAME = "author_key";

export function readAuthorKeyFromCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [rawName, ...rest] = part.trim().split("=");
    if (rawName === COOKIE_NAME) {
      const value = rest.join("=").trim();
      return value || null;
    }
  }
  return null;
}

export function createAuthorKey(): string {
  return crypto.randomUUID();
}

export function authorKeySetCookie(authorKey: string): string {
  return `${COOKIE_NAME}=${authorKey}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`;
}

/** Resolve authorKey from cookie or create a new one. */
export function attachAuthorKey(cookieHeader: string | undefined): {
  authorKey: string;
  setCookie: string | null;
} {
  const existing = readAuthorKeyFromCookie(cookieHeader);
  if (existing) {
    return { authorKey: existing, setCookie: null };
  }
  const authorKey = createAuthorKey();
  return { authorKey, setCookie: authorKeySetCookie(authorKey) };
}
