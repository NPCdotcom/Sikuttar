---
title: ADR 0001 — Cloudflare 意味検索の料金・デプロイトレードオフ
status: accepted
date: "2026-10-17"
accepted_at: "2026-10-17"
related: docs/design/elements/semantic-search.md
---

# ADR 0001 — Cloudflare 意味検索のコスト・デプロイ境界

## Context

wave2 で意味検索（厚い）を採用する。Workers AI（埋め込み）と Vectorize（近傍）を使うと Cloudflare 課金が発生しうる。ユーザー合意（2026-10-17）: **最低限公開できる段階でまとめて CF に上げる**。ローカルで動く間は頻繁にデプロイしない。

## Decision

1. **第一経路（本番公開時）**: Cloudflare Workers + D1 remote + Workers AI embeddings + Vectorize
2. **必須フォールバック（ローカル／未バインド）**: D1 ベース類似（既存 S3 factors）— 課金ゼロで開発継続
3. **デプロイ境界（Go / No-Go）**

| 状態 | CF デプロイ |
|------|-------------|
| 画面・API がローカルだけで検証可能（フォールバック検索含む） | **上げない**（または極まれな疎通確認のみ） |
| wave2 の公開デモ一式が揃った（GitHub OAuth · タグ · ブックマーク · 意味検索本番経路） | **まとめて初回公開デプロイ** |
| 意味検索を本番フラグでオンにする直前 | Workers Paid 要否確認 · Vectorize インデックス作成 |

4. **生成 LLM は検索結果の再要約に必須としない**（本文提示のみ）— Neuron 消費を抑える
5. 認証は **GitHub OAuth**（subject を accounts に紐づけ）

## Consequences

- 日常開発はローカル完結 → デプロイ疲れと課金リスクを下げる
- 初回公開は「まとめて動く」チェックリストが必要（README / 後続 plan に落とす）
- Paid 契約は「Vectorize 本番オン」のゲートに紐づく
