export type Env = {
  DB: D1Database;
  /** SPA static assets (Workers Assets). Optional in API-only local wrangler. */
  ASSETS?: Fetcher;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GITHUB_OAUTH_REDIRECT_URI?: string;
  /** Where to send the browser after successful OAuth (default local web). */
  OAUTH_SUCCESS_REDIRECT?: string;
  /** `vectorize` | `fallback` (default fallback until Paid/Vectorize gate). */
  SEMANTIC_SEARCH?: string;
  /** `on` | `off` (default off). Secretary Q&A · Free deploy uses on. */
  SECRETARY_QA?: string;
  /** Workers AI binding — optional until vectorize gate. */
  AI?: Ai;
  /** Vectorize index binding — optional until vectorize gate. */
  VECTORIZE?: Vectorize;
};
