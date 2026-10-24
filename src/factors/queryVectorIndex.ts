export type VectorIndex = Pick<Vectorize, "query">;

/**
 * Cosine scores below this are treated as unrelated (Vectorize always returns topK).
 * Tuned 2026-10-22: related ~0.48+, empty/cooking ~0.39.
 */
export const MIN_VECTOR_SCORE = 0.45;

/** Query nearest story ids from Vectorize, dropping weak matches. */
export async function queryVectorIndex(
  index: VectorIndex,
  vector: number[],
  topK: number,
  minScore = MIN_VECTOR_SCORE,
): Promise<string[]> {
  const matches = await index.query(vector, { topK });
  return (matches.matches ?? [])
    .filter((m) => (m.score ?? 0) >= minScore && Boolean(m.id))
    .map((m) => m.id);
}
