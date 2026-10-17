export type Env = {
  DB: D1Database;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GITHUB_OAUTH_REDIRECT_URI?: string;
  /** Where to send the browser after successful OAuth (default local web). */
  OAUTH_SUCCESS_REDIRECT?: string;
  SEMANTIC_SEARCH?: string;
};
