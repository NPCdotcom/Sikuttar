import { countPublicReactions } from "./countPublicReactions";
import { listByCreatedAtDesc, type StoryRow } from "./listByCreatedAtDesc";
import { loadTagsByStoryIds } from "./loadTagsByStoryIds";
import { StoryNotFoundError } from "./persistReaction";
import {
  applyWakaruBoost,
  passesTokenMatchFloor,
  scoreTokenMatch,
} from "./scoreStorySimilarity";
import {
  storyTextForSimilarityWithTags,
  tokenizeForSimilarity,
} from "./tokenizeForSimilarity";

export type RelatedHit = {
  row: StoryRow;
  score: number;
};

export async function findRelatedStories(
  db: D1Database,
  storyId: string,
  limit = 3,
): Promise<RelatedHit[]> {
  const query = await db
    .prepare(
      `SELECT id, body, situation, cause, created_at, author_key
       FROM failure_stories WHERE id = ?`,
    )
    .bind(storyId)
    .first<StoryRow>();
  if (!query) {
    throw new StoryNotFoundError();
  }

  const candidates = await listByCreatedAtDesc(db, 200);
  const others = candidates.filter((c) => c.id !== storyId);
  if (others.length === 0) {
    return [];
  }

  const allIds = [query.id, ...others.map((c) => c.id)];
  const tagsMap = await loadTagsByStoryIds(db, allIds);
  const countsMap = await countPublicReactions(
    db,
    others.map((c) => c.id),
  );
  const queryTokens = tokenizeForSimilarity(
    storyTextForSimilarityWithTags(query, tagsMap.get(query.id) ?? []),
  );

  const scored: RelatedHit[] = others
    .map((row) => {
      const candidateTokens = tokenizeForSimilarity(
        storyTextForSimilarityWithTags(row, tagsMap.get(row.id) ?? []),
      );
      if (!passesTokenMatchFloor(queryTokens, candidateTokens)) {
        return null;
      }
      const base = scoreTokenMatch(queryTokens, candidateTokens);
      const wakaru = countsMap.get(row.id)?.wakaru ?? 0;
      return { row, score: applyWakaruBoost(base, wakaru) };
    })
    .filter((h): h is RelatedHit => h !== null);

  scored.sort(
    (a, b) =>
      b.score - a.score || b.row.created_at.localeCompare(a.row.created_at),
  );
  return scored.filter((h) => h.score > 0).slice(0, limit);
}
