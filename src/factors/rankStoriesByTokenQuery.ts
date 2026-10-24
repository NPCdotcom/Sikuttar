import type { StoryRow } from "./listByCreatedAtDesc";
import {
  applyWakaruBoost,
  passesQueryFloor,
  scoreTokenMatch,
} from "./scoreStorySimilarity";
import {
  storyTextForSimilarityWithTags,
  tokenizeForSimilarity,
  tokenizeQueryForFloor,
} from "./tokenizeForSimilarity";

export type RankableStory = {
  row: StoryRow;
  tags?: string[];
  wakaru?: number;
};

export type RankedStoryHit = {
  row: StoryRow;
  score: number;
};

/**
 * Sync token ranker used by fallback search and eval fixtures.
 * Floor uses surface query tokens; ranking uses full similarity tokens (incl. bigrams).
 */
export function rankStoriesByTokenQuery(
  query: string,
  candidates: RankableStory[],
  limit = 20,
): RankedStoryHit[] {
  const q = query.trim();
  if (!q || candidates.length === 0) {
    return [];
  }

  const floorQueryTokens = tokenizeQueryForFloor(q);
  if (floorQueryTokens.size === 0) {
    return [];
  }
  const scoreQueryTokens = tokenizeForSimilarity(q);

  const scored: RankedStoryHit[] = [];
  for (const c of candidates) {
    const text = storyTextForSimilarityWithTags(c.row, c.tags ?? []);
    const candidateTokens = tokenizeForSimilarity(text);
    if (!passesQueryFloor(floorQueryTokens, candidateTokens)) {
      continue;
    }
    const base = scoreTokenMatch(scoreQueryTokens, candidateTokens);
    const score = applyWakaruBoost(base, c.wakaru ?? 0);
    if (score > 0) {
      scored.push({ row: c.row, score });
    }
  }

  scored.sort(
    (a, b) =>
      b.score - a.score || b.row.created_at.localeCompare(a.row.created_at),
  );
  return scored.slice(0, limit);
}
