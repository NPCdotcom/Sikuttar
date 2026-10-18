/** Jaccard similarity on token sets. */
export function scoreStorySimilarity(
  queryTokens: Set<string>,
  candidateTokens: Set<string>,
): number {
  if (queryTokens.size === 0 && candidateTokens.size === 0) {
    return 0;
  }
  const intersection = countIntersection(queryTokens, candidateTokens);
  const union = queryTokens.size + candidateTokens.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/** Fraction of query tokens present in the candidate. */
export function scoreQueryCoverage(
  queryTokens: Set<string>,
  candidateTokens: Set<string>,
): number {
  if (queryTokens.size === 0) {
    return 0;
  }
  return countIntersection(queryTokens, candidateTokens) / queryTokens.size;
}

/**
 * Hybrid token match: coverage-weighted (cuts weak CJK-bigram noise).
 * base = 0.6 * coverage + 0.4 * jaccard
 */
export function scoreTokenMatch(
  queryTokens: Set<string>,
  candidateTokens: Set<string>,
): number {
  const coverage = scoreQueryCoverage(queryTokens, candidateTokens);
  const jaccard = scoreStorySimilarity(queryTokens, candidateTokens);
  return 0.6 * coverage + 0.4 * jaccard;
}

/**
 * Drop empty intersection; for |Q| >= 3 also require coverage >= 0.2.
 */
export function passesTokenMatchFloor(
  queryTokens: Set<string>,
  candidateTokens: Set<string>,
): boolean {
  const intersection = countIntersection(queryTokens, candidateTokens);
  if (intersection === 0) {
    return false;
  }
  if (queryTokens.size >= 3) {
    return scoreQueryCoverage(queryTokens, candidateTokens) >= 0.2;
  }
  return true;
}

function countIntersection(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const t of a) {
    if (b.has(t)) {
      n += 1;
    }
  }
  return n;
}

/** Tiny constant boost from public 「わかる」 counts (charter similarity signal). */
export const WAKARU_BOOST_PER_COUNT = 0.02;

export function applyWakaruBoost(jaccard: number, wakaruCount: number): number {
  return jaccard + Math.max(0, wakaruCount) * WAKARU_BOOST_PER_COUNT;
}
