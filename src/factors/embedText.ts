import { EMBEDDING_MODEL } from "./semanticSearchMode";

export class EmbedTextError extends Error {
  constructor(message = "embedding failed") {
    super(message);
    this.name = "EmbedTextError";
  }
}

/** Embed text via Workers AI (bge-m3). */
export async function embedText(ai: Ai, text: string): Promise<number[]> {
  const result = await ai.run(EMBEDDING_MODEL, {
    text: [text],
  });

  const data =
    result &&
    typeof result === "object" &&
    "data" in result &&
    Array.isArray((result as { data?: unknown }).data)
      ? ((result as { data: number[][] }).data[0] ?? null)
      : null;

  if (!data || data.length === 0) {
    throw new EmbedTextError();
  }
  return data;
}
