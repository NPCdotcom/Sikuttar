import type { Env } from "../env";

export const EMBEDDING_MODEL = "@cf/baai/bge-m3" as const;

/** True when flag is vectorize and both AI + Vectorize bindings exist. */
export function canUseVectorize(env: Env): boolean {
  return (
    env.SEMANTIC_SEARCH === "vectorize" &&
    env.AI !== undefined &&
    env.VECTORIZE !== undefined
  );
}
