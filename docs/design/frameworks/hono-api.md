---
title: H3 フレームワーク — HTTP API（Hono）· FW2
kind: design
phase: P3
scope_level: H3
status: agreed
agreed_at: "2026-10-15"
framework_id: FW2
slice: S1+S2
related_h3: docs/design/frameworks/failure-share-h3.md
related_systems:
  - docs/design/systems/story-posting.md
  - docs/design/systems/feed-reading.md
  - docs/design/systems/reaction-signaling.md
created: "2026-10-15"
updated: "2026-10-15"
---

# Framework — HTTP API（Hono）· FW2

親: [failure-share-h3](failure-share-h3.md)  
支える: SYS1 · SYS2 · SYS3 の HTTP 境界  
Assumption: Hono · TypeScript（charter §7）

## 目的

投稿受付・一覧取得・リアクション付与を HTTP で公開し、製品因子を関数としてつなぐ。

## Recognition

| 認識単位 | 一文 |
|----------|------|
| HTTP API 枠 | SYS1/SYS2/SYS3 の入出力ポート（ブラウザ ↔ Store） |

## Factors（API に載せる）

| 因子 | 種別 | エンドポイント案 |
|------|------|------------------|
| 入力を受ける · 検証する · 永続化する | SYS1 | `POST /stories` |
| 一覧を読み出す · 匿名化する · 公開件数 | SYS2+SYS3 | `GET /stories` |
| リアクションを検証・永続化する | SYS3 | `POST /stories/:id/reactions` |
| authorKey を付与する | function | Cookie → SYS1/SYS3 |

レスポンスの一覧項目から `authorKey` / 属性 / `bad` 件数を落とす。

## モジュール境界

```text
Hono app
  ├─ middleware: ensureAuthorKey
  ├─ POST /stories              → validate → persist → 201
  ├─ GET  /stories              → list → anonymize → public counts → 200
  └─ POST /stories/:id/reactions → validateKind → persistReaction → 201
```

メッセージ `FailureStoryPersisted` / `ReactionPersisted` は同プロセス内の関数呼び出しフックとして残す。

## 境界・非目的

- **含む**: S1 の 2 エンドポイント + S2 リアクション + authorKey
- **含まない**: 認証プロバイダ本接続 · GraphQL 必須化 · BAD 公開エンドポイント · コメント API

## エージェント提案

| 案 | 概要 | 推奨 |
|----|------|------|
| A | 上記 REST 最小 2 本 | **推奨** |
| B | RPC / tRPC 一択 | 学習コスト・境界の見え方でトレードオフ |
| C | 静的 JSON のみ（API なし） | デモ退行 → 非推奨 |

**推奨: A**

## Open questions

- [x] `POST/GET /stories` の最小 REST でよいか → **yes**
- エラー形式 → P4（非ブロッカー）

## 次

- [x] 合意 → agreed
- [ ] P4: handlers の program
