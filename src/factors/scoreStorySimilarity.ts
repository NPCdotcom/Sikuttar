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
 * base = 0.7 * coverage + 0.3 * jaccard
 */
export function scoreTokenMatch(
  queryTokens: Set<string>,
  candidateTokens: Set<string>,
): number {
  const coverage = scoreQueryCoverage(queryTokens, candidateTokens);
  const jaccard = scoreStorySimilarity(queryTokens, candidateTokens);
  return 0.7 * coverage + 0.3 * jaccard;
}

/**
 * Drop empty intersection.
 * |Q| <= 2: require full query coverage (cuts weak bigram noise).
 * |Q| >= 3: require coverage >= 0.2.
 */
export function passesTokenMatchFloor(
  queryTokens: Set<string>,
  candidateTokens: Set<string>,
): boolean {
  const intersection = countIntersection(queryTokens, candidateTokens);
  if (intersection === 0) {
    return false;
  }
  const coverage = scoreQueryCoverage(queryTokens, candidateTokens);
  if (queryTokens.size <= 2) {
    return coverage >= 1;
  }
  return coverage >= 0.2;
}

/**
 * Whether a floor surface token is evidenced in candidate similarity tokens
 * (exact hit, or enough CJK char-bigrams present).
 */
export function floorTokenMatched(
  token: string,
  candidateTokens: Set<string>,
): boolean {
  if (candidateTokens.has(token)) {
    return true;
  }
  if (token.length < 2) {
    return false;
  }
  const hasLatin = /[a-z0-9]/i.test(token);
  if (hasLatin) {
    return false;
  }
  let hits = 0;
  let total = 0;
  for (let i = 0; i < token.length - 1; i++) {
    total += 1;
    if (candidateTokens.has(token.slice(i, i + 2))) {
      hits += 1;
    }
  }
  if (total === 0) {
    return false;
  }
  // Short content (2–3 chars): any bigram. Longer: at least half the bigrams.
  if (token.length <= 3) {
    return hits >= 1;
  }
  return hits / total >= 0.5;
}

/** Floor coverage using surface query tokens against candidate similarity tokens. */
export function scoreFloorCoverage(
  floorQueryTokens: Set<string>,
  candidateTokens: Set<string>,
): number {
  if (floorQueryTokens.size === 0) {
    return 0;
  }
  let matched = 0;
  for (const t of floorQueryTokens) {
    if (floorTokenMatched(t, candidateTokens)) {
      matched += 1;
    }
  }
  return matched / floorQueryTokens.size;
}

/**
 * Floor gate for user/search queries: surface tokens on the query side
 * (see tokenizeQueryForFloor), similarity tokens on the candidate side.
 */
export function passesQueryFloor(
  floorQueryTokens: Set<string>,
  candidateTokens: Set<string>,
): boolean {
  if (floorQueryTokens.size === 0) {
    return false;
  }
  const coverage = scoreFloorCoverage(floorQueryTokens, candidateTokens);
  if (coverage <= 0) {
    return false;
  }
  if (floorQueryTokens.size <= 2) {
    return coverage >= 1;
  }
  return coverage >= 0.2;
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
