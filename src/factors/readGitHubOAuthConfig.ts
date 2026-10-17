import type { Env } from "../env";
import type { GitHubOAuthConfig } from "./exchangeGitHubOAuth";

export class MissingOAuthConfigError extends Error {
  constructor() {
    super("GitHub OAuth is not configured");
    this.name = "MissingOAuthConfigError";
  }
}

export function readGitHubOAuthConfig(env: Env): GitHubOAuthConfig {
  const clientId = env.GITHUB_CLIENT_ID?.trim();
  const clientSecret = env.GITHUB_CLIENT_SECRET?.trim();
  const redirectUri = env.GITHUB_OAUTH_REDIRECT_URI?.trim();
  if (!clientId || !clientSecret || !redirectUri) {
    throw new MissingOAuthConfigError();
  }
  return { clientId, clientSecret, redirectUri };
}

export function oauthSuccessRedirect(env: Env): string {
  return (
    env.OAUTH_SUCCESS_REDIRECT?.trim() || "http://127.0.0.1:5173"
  );
}
