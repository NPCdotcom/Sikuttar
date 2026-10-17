export type VectorIndex = Pick<Vectorize, "query">;

/** Query nearest story ids from Vectorize. */
export async function queryVectorIndex(
  index: VectorIndex,
  vector: number[],
  topK: number,
): Promise<string[]> {
  const matches = await index.query(vector, { topK });
  return (matches.matches ?? []).map((m) => m.id).filter(Boolean);
}
