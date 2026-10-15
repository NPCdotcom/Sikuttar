/** Jaccard similarity on token sets. */
export function scoreStorySimilarity(
  queryTokens: Set<string>,
  candidateTokens: Set<string>,
): number {
  if (queryTokens.size === 0 && candidateTokens.size === 0) {
    return 0;
  }
  let intersection = 0;
  for (const t of queryTokens) {
    if (candidateTokens.has(t)) {
      intersection += 1;
    }
  }
  const union = queryTokens.size + candidateTokens.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/** Tiny constant boost from public 「わかる」 counts (charter similarity signal). */
export const WAKARU_BOOST_PER_COUNT = 0.02;

export function applyWakaruBoost(jaccard: number, wakaruCount: number): number {
  return jaccard + Math.max(0, wakaruCount) * WAKARU_BOOST_PER_COUNT;
}
