import { countPublicReactions } from "./countPublicReactions";
import { listByCreatedAtDesc, type StoryRow } from "./listByCreatedAtDesc";
import { loadTagsByStoryIds } from "./loadTagsByStoryIds";
import { rankStoriesByTokenQuery } from "./rankStoriesByTokenQuery";

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

  const tagsMap = await loadTagsByStoryIds(
    db,
    candidates.map((c) => c.id),
  );
  const countsMap = await countPublicReactions(
    db,
    candidates.map((c) => c.id),
  );

  const ranked = rankStoriesByTokenQuery(
    q,
    candidates.map((row) => ({
      row,
      tags: tagsMap.get(row.id) ?? [],
      wakaru: countsMap.get(row.id)?.wakaru ?? 0,
    })),
    limit,
  );
  return ranked.map((h) => h.row);
}
