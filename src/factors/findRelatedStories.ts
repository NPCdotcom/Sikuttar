import { countPublicReactions } from "./countPublicReactions";
import { listByCreatedAtDesc, type StoryRow } from "./listByCreatedAtDesc";
import { StoryNotFoundError } from "./persistReaction";
import { applyWakaruBoost, scoreStorySimilarity } from "./scoreStorySimilarity";
import {
  storyTextForSimilarity,
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

  const countsMap = await countPublicReactions(
    db,
    others.map((c) => c.id),
  );
  const queryTokens = tokenizeForSimilarity(storyTextForSimilarity(query));

  const scored: RelatedHit[] = others.map((row) => {
    const candidateTokens = tokenizeForSimilarity(storyTextForSimilarity(row));
    const jaccard = scoreStorySimilarity(queryTokens, candidateTokens);
    const wakaru = countsMap.get(row.id)?.wakaru ?? 0;
    return { row, score: applyWakaruBoost(jaccard, wakaru) };
  });

  scored.sort((a, b) => b.score - a.score || b.row.created_at.localeCompare(a.row.created_at));
  return scored.filter((h) => h.score > 0).slice(0, limit);
}
