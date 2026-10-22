import type { StoryRow } from "../../src/factors/listByCreatedAtDesc";
import type { RankableStory } from "../../src/factors/rankStoriesByTokenQuery";

function row(
  id: string,
  body: string,
  extras: Partial<Pick<StoryRow, "situation" | "cause">> = {},
): StoryRow {
  return {
    id,
    body,
    situation: extras.situation ?? null,
    cause: extras.cause ?? null,
    created_at: "2026-10-01T00:00:00.000Z",
    author_key: "eval-ak",
  };
}

/** Fixed mini corpus for question-quality eval (no D1). */
export const EVAL_MINI_CORPUS: RankableStory[] = [
  {
    row: row(
      "c-deploy",
      "本番デプロイ前の確認を飛ばして障害を出した",
      { situation: "リリース作業", cause: "チェックリスト未実施" },
    ),
    tags: ["デプロイ", "運用"],
    wakaru: 3,
  },
  {
    row: row(
      "c-oauth",
      "GitHub OAuth のコールバック URL を localhost と 127.0.0.1 で混ぜてログインできなかった",
      { situation: "ローカル認証", cause: "コールバックと Cookie ホストの不一致" },
    ),
    tags: ["OAuth", "認証"],
    wakaru: 2,
  },
  {
    row: row(
      "c-test",
      "テストを書かずにマージして本番で壊した",
      { situation: "CI なし", cause: "手動確認だけに頼った" },
    ),
    tags: ["テスト", "品質"],
    wakaru: 1,
  },
  {
    row: row(
      "c-d1",
      "D1 のマイグレーションをローカルに当て忘れ API が落ちた",
      { situation: "スキーマ変更", cause: "migrations apply --local を忘れた" },
    ),
    tags: ["D1", "マイグレーション"],
    wakaru: 0,
  },
  {
    row: row(
      "c-cookie",
      "Cookie の Secure 属性でローカル開発が詰まった",
      { situation: "セッション", cause: "localhost 設定の見落とし" },
    ),
    tags: ["Cookie", "セッション"],
    wakaru: 0,
  },
];
