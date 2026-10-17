import type { Env } from "../env";
import { embedText } from "./embedText";
import { canUseVectorize } from "./semanticSearchMode";
import { storyTextForSimilarity } from "./tokenizeForSimilarity";

export type StoryForEmbedding = {
  id: string;
  body: string;
  situation: string | null;
  cause: string | null;
};

/**
 * Index a persisted story in Vectorize. No-op when fallback / unbound.
 */
export async function upsertStoryEmbedding(
  env: Env,
  story: StoryForEmbedding,
): Promise<void> {
  if (!canUseVectorize(env)) {
    return;
  }

  const text = storyTextForSimilarity(story);
  if (!text.trim()) {
    return;
  }

  const vector = await embedText(env.AI!, text);
  await env.VECTORIZE!.upsert([{ id: story.id, values: vector }]);
}
