import { githubSubjectFromUserId } from "./githubSubject";

export type GitHubOAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export class GitHubOAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitHubOAuthError";
  }
}

export function buildGitHubAuthorizeUrl(
  config: GitHubOAuthConfig,
  state: string,
): string {
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("scope", "read:user");
  url.searchParams.set("state", state);
  return url.toString();
}

/**
 * Exchange authorization code for opaque subject `github:<id>`.
 * GitHub-specific HTTP stays inside this factor (NFR8).
 */
export async function exchangeGitHubCodeForSubject(
  config: GitHubOAuthConfig,
  code: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const tokenRes = await fetchImpl(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.redirectUri,
      }),
    },
  );
  if (!tokenRes.ok) {
    throw new GitHubOAuthError("token exchange failed");
  }
  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    error?: string;
  };
  if (!tokenJson.access_token) {
    throw new GitHubOAuthError(tokenJson.error ?? "missing access_token");
  }

  const userRes = await fetchImpl("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${tokenJson.access_token}`,
      "User-Agent": "Sikuttar",
    },
  });
  if (!userRes.ok) {
    throw new GitHubOAuthError("user profile fetch failed");
  }
  const user = (await userRes.json()) as { id?: number };
  if (user.id == null) {
    throw new GitHubOAuthError("missing user id");
  }
  return githubSubjectFromUserId(user.id);
}
