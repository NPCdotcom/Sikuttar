export type SecretaryEvidenceItem = {
  id: string;
  body: string;
  situation: string | null;
  cause: string | null;
  tags: string[];
  role: "corpus" | "bookmark";
};

export type AssembleSecretaryInput = {
  attributeHint: string | null;
  evidence: SecretaryEvidenceItem[];
};

const INSUFFICIENT =
  "蓄積された失敗談からは、この話題について確認できる根拠が見つかりませんでした。";

/** Fixed template + slots (ADR 0002). Caller must not invoke when evidence is empty. */
export function assembleSecretaryTemplate(
  input: AssembleSecretaryInput,
): string {
  const { attributeHint, evidence } = input;
  if (evidence.length === 0) {
    return INSUFFICIENT;
  }

  const cause =
    evidence.map((e) => e.cause?.trim()).find((c) => c) ??
    evidence.map((e) => e.situation?.trim()).find((s) => s) ??
    "（投稿からは特定の原因記述が見つかりませんでした）";

  const solution =
    evidence
      .map((e) => e.situation?.trim() || e.body.trim().slice(0, 80))
      .find((s) => s) ?? "（解決の記述は根拠投稿から拾えませんでした）";

  const bookmark = evidence.find((e) => e.role === "bookmark");
  const tagCounts = new Map<string, number>();
  for (const e of evidence) {
    for (const t of e.tags) {
      tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
    }
  }
  const topTag =
    [...tagCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const parts: string[] = [];
  if (attributeHint) {
    parts.push(
      `このような失敗は、${attributeHint}の人に良く見られるみたいです。`,
    );
  }
  parts.push(`原因としては${cause}があります。`);
  parts.push(`解決の例は${solution}などがあります。`);
  if (bookmark) {
    const label = bookmark.body.trim().slice(0, 40);
    parts.push(
      `これは、あなたのブックマークの「${label}${bookmark.body.length > 40 ? "…" : ""}」にも類似しています。`,
    );
  }
  if (topTag) {
    parts.push(`${topTag}のようなタグが関連性が強いです。`);
  }

  return parts.join("");
}

export function insufficientSecretaryAnswer(): string {
  return INSUFFICIENT;
}
