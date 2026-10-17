export const RECOMMENDED_TAGS = [
  "デプロイ",
  "レビュー",
  "コミュニケーション",
  "見積もり",
  "オンボーディング",
  "インシデント",
  "テスト",
] as const;

export function listRecommendedTags(): string[] {
  return [...RECOMMENDED_TAGS];
}
