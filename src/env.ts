export type Env = {
  DB: D1Database;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GITHUB_OAUTH_REDIRECT_URI?: string;
  /** Where to send the browser after successful OAuth (default local web). */
  OAUTH_SUCCESS_REDIRECT?: string;
  /** `vectorize` | `fallback` (default fallback until Paid/Vectorize gate). */
  SEMANTIC_SEARCH?: string;
  /** Workers AI binding — optional until vectorize gate. */
  AI?: Ai;
  /** Vectorize index binding — optional until vectorize gate. */
  VECTORIZE?: Vectorize;
};
