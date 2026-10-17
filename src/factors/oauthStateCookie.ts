const STATE_COOKIE = "oauth_state";

export function createOAuthState(): string {
  return crypto.randomUUID();
}

export function oauthStateSetCookie(state: string): string {
  return `${STATE_COOKIE}=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`;
}

export function oauthStateClearCookie(): string {
  return `${STATE_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function readOAuthStateFromCookie(
  cookieHeader: string | undefined,
): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rest] = part.trim().split("=");
    if (rawName === STATE_COOKIE) {
      const value = rest.join("=").trim();
      return value || null;
    }
  }
  return null;
}
