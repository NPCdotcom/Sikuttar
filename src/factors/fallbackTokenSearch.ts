import { countPublicReactions } from "./countPublicReactions";
import { listByCreatedAtDesc, type StoryRow } from "./listByCreatedAtDesc";
import {
  applyWakaruBoost,
  passesTokenMatchFloor,
  scoreTokenMatch,
} from "./scoreStorySimilarity";
import {
  storyTextForSimilarity,
  tokenizeForSimilarity,
} from "./tokenizeForSimilarity";

/**
 * Free-query Jaccard search over recent stories (FR12 fallback).
 */
export async function fallbackTokenSearch(
  db: D1Database,
  query: string,
  limit = 20,
): Promise<StoryRow[]> {
  const q = query.trim();
  if (!q) {
    return [];
  }

  const candidates = await listByCreatedAtDesc(db, 200);
  if (candidates.length === 0) {
    return [];
  }

  const queryTokens = tokenizeForSimilarity(q);
  if (queryTokens.size === 0) {
    return [];
  }

  const countsMap = await countPublicReactions(
    db,
    candidates.map((c) => c.id),
  );

  const scored = candidates
    .map((row) => {
      const candidateTokens = tokenizeForSimilarity(
        storyTextForSimilarity(row),
      );
      if (!passesTokenMatchFloor(queryTokens, candidateTokens)) {
        return null;
      }
      const base = scoreTokenMatch(queryTokens, candidateTokens);
      const wakaru = countsMap.get(row.id)?.wakaru ?? 0;
      return { row, score: applyWakaruBoost(base, wakaru) };
    })
    .filter((h): h is { row: StoryRow; score: number } => h !== null);

  scored.sort(
    (a, b) =>
      b.score - a.score || b.row.created_at.localeCompare(a.row.created_at),
  );
  return scored.filter((h) => h.score > 0).slice(0, limit).map((h) => h.row);
}
