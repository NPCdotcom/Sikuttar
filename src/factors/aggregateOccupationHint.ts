/**
 * Among focus-story author occupations, return the mode if it covers ≥1/3
 * of the focus set size (FR24). Empty / null occupations are ignored in the
 * numerator but the denominator is the full focus set length.
 */
export function aggregateOccupationHint(
  occupations: Array<string | null | undefined>,
): string | null {
  const n = occupations.length;
  if (n === 0) return null;

  const counts = new Map<string, number>();
  for (const raw of occupations) {
    const occ = raw?.trim();
    if (!occ) continue;
    counts.set(occ, (counts.get(occ) ?? 0) + 1);
  }
  if (counts.size === 0) return null;

  let best: string | null = null;
  let bestCount = 0;
  for (const [occ, count] of counts) {
    if (count > bestCount) {
      best = occ;
      bestCount = count;
    }
  }
  if (!best || bestCount * 3 < n) return null;
  return best;
}

/** Load occupation for each author_key (order preserved via story authors). */
export async function loadOccupationsForAuthorKeys(
  db: D1Database,
  authorKeys: string[],
): Promise<Array<string | null>> {
  if (authorKeys.length === 0) return [];

  const unique = [...new Set(authorKeys)];
  const placeholders = unique.map(() => "?").join(", ");
  const result = await db
    .prepare(
      `SELECT author_key AS authorKey, occupation
       FROM accounts
       WHERE author_key IN (${placeholders})`,
    )
    .bind(...unique)
    .all<{ authorKey: string; occupation: string | null }>();

  const map = new Map<string, string | null>();
  for (const row of result.results ?? []) {
    map.set(row.authorKey, row.occupation);
  }
  return authorKeys.map((k) => map.get(k) ?? null);
}
