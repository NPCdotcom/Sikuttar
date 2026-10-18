/** Split on whitespace/punctuation; keep parts length≥2; add char bigrams for CJK runs. */
export function tokenizeForSimilarity(text: string): Set<string> {
  const normalized = text.normalize("NFKC").toLowerCase();
  const parts = normalized
    .split(/[\s\u3000、。，．！？!?・「」『』（）()【】\[\],./\\|;:_-]+/u)
    .map((p) => p.trim())
    .filter(Boolean);

  const tokens = new Set<string>();
  for (const part of parts) {
    if (part.length >= 2) {
      tokens.add(part);
    }
    const hasLatin = /[a-z0-9]/i.test(part);
    if (!hasLatin && part.length >= 2) {
      for (let i = 0; i < part.length - 1; i++) {
        tokens.add(part.slice(i, i + 2));
      }
    }
  }
  return tokens;
}

export function storyTextForSimilarity(input: {
  body: string;
  situation: string | null;
  cause: string | null;
}): string {
  return [input.body, input.situation ?? "", input.cause ?? ""]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ");
}

/** Body/situation/cause plus classification tags for token scoring. */
export function storyTextForSimilarityWithTags(
  input: {
    body: string;
    situation: string | null;
    cause: string | null;
  },
  tags: string[] = [],
): string {
  const base = storyTextForSimilarity(input);
  const tagPart = tags.map((t) => t.trim()).filter(Boolean).join(" ");
  return [base, tagPart].filter(Boolean).join(" ");
}
