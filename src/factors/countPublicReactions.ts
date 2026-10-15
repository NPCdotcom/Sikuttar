export type PublicCounts = {
  wakaru: number;
  reference: number;
};

export async function countPublicReactions(
  db: D1Database,
  storyIds: string[],
): Promise<Map<string, PublicCounts>> {
  const map = new Map<string, PublicCounts>();
  for (const id of storyIds) {
    map.set(id, { wakaru: 0, reference: 0 });
  }
  if (storyIds.length === 0) {
    return map;
  }

  const placeholders = storyIds.map(() => "?").join(", ");
  const rows = await db
    .prepare(
      `SELECT story_id, kind, COUNT(*) AS n
       FROM reactions
       WHERE story_id IN (${placeholders})
         AND kind IN ('wakaru', 'reference')
       GROUP BY story_id, kind`,
    )
    .bind(...storyIds)
    .all<{ story_id: string; kind: "wakaru" | "reference"; n: number }>();

  for (const row of rows.results ?? []) {
    const counts = map.get(row.story_id) ?? { wakaru: 0, reference: 0 };
    counts[row.kind] = Number(row.n);
    map.set(row.story_id, counts);
  }
  return map;
}

/** Ensure public JSON never exposes bad counts (defense in depth). */
export function maskBadFromPublic(counts: PublicCounts): PublicCounts {
  return {
    wakaru: counts.wakaru,
    reference: counts.reference,
  };
}
