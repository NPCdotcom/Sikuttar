const SPLIT_RE =
  /[\s\u3000、。，．！？!?・「」『』（）()【】\[\],./\\|;:_-]+/u;

/** Common JA function crumbs → spaces so long questions yield surface content tokens. */
const FLOOR_LOOSEN_RE =
  /について|でしょうか|ですか|という|ときの|しまった|しまい|など|って|とは|から|まで|より|そして|また|または|そして/gu;
const FLOOR_PARTICLE_RE = /[をがにはとてたでもへやの]/gu;

function splitParts(normalized: string): string[] {
  return normalized
    .split(SPLIT_RE)
    .map((p) => p.trim())
    .filter(Boolean);
}

function addBigrams(tokens: Set<string>, part: string): void {
  const hasLatin = /[a-z0-9]/i.test(part);
  if (!hasLatin && part.length >= 2) {
    for (let i = 0; i < part.length - 1; i++) {
      tokens.add(part.slice(i, i + 2));
    }
  }
}

/** Split on whitespace/punctuation; keep parts length≥2; add char bigrams for CJK runs. */
export function tokenizeForSimilarity(text: string): Set<string> {
  const normalized = text.normalize("NFKC").toLowerCase();
  const parts = splitParts(normalized);

  const tokens = new Set<string>();
  for (const part of parts) {
    if (part.length >= 2) {
      tokens.add(part);
    }
    addBigrams(tokens, part);
  }
  return tokens;
}

/**
 * Floor-only query tokens: surface parts after light JA loosening.
 * No CJK bigram expansion — avoids long-question |Q| inflation that zeroed coverage.
 */
export function tokenizeQueryForFloor(text: string): Set<string> {
  const normalized = text.normalize("NFKC").toLowerCase();
  const loosened = normalized
    .replace(FLOOR_LOOSEN_RE, " ")
    .replace(FLOOR_PARTICLE_RE, " ");
  const parts = splitParts(loosened);

  const tokens = new Set<string>();
  for (const part of parts) {
    if (part.length >= 2) {
      tokens.add(part);
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
