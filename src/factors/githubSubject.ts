/** Build opaque auth subject from GitHub numeric user id (IdP boundary). */
export function githubSubjectFromUserId(userId: number | string): string {
  const id = String(userId).trim();
  if (!/^\d+$/.test(id)) {
    throw new Error("invalid GitHub user id");
  }
  return `github:${id}`;
}
