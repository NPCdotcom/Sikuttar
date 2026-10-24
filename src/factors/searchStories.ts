import type { Env } from "../env";
import { embedText } from "./embedText";
import { fallbackTokenSearch } from "./fallbackTokenSearch";
import { hydrateStoriesByIds } from "./hydrateStoriesByIds";
import type { StoryRow } from "./listByCreatedAtDesc";
import { queryVectorIndex } from "./queryVectorIndex";
import { canUseVectorize } from "./semanticSearchMode";

/**
 * Query → similar failure stories (Vectorize when bound, else Jaccard).
 */
export async function searchStories(
  env: Env,
  query: string,
  limit = 20,
): Promise<StoryRow[]> {
  const q = query.trim();
  if (!q) {
    return [];
  }

  if (canUseVectorize(env)) {
    try {
      const vector = await embedText(env.AI!, q);
      const ids = await queryVectorIndex(env.VECTORIZE!, vector, limit);
      if (ids.length > 0) {
        return await hydrateStoriesByIds(env.DB, ids);
      }
      // No strong vector hits → token fallback (empty / weak paraphrase edge)
      return fallbackTokenSearch(env.DB, q, limit);
    } catch {
      // FR12: never die on Vectorize/AI failure alone
      return fallbackTokenSearch(env.DB, q, limit);
    }
  }

  return fallbackTokenSearch(env.DB, q, limit);
}
