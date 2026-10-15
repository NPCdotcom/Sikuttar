---
title: H3 フレームワーク — HTTP API（Hono）· FW2
kind: design
phase: P3
scope_level: H3
status: agreed
agreed_at: "2026-10-15"
framework_id: FW2
slice: S1
related_h3: docs/design/frameworks/failure-share-h3.md
related_systems:
  - docs/design/systems/story-posting.md
  - docs/design/systems/feed-reading.md
created: "2026-10-15"
updated: "2026-10-15"
---

# Framework — HTTP API（Hono）· FW2

親: [failure-share-h3](failure-share-h3.md)  
支える: SYS1 · SYS2 の HTTP 境界  
Assumption: Hono · TypeScript（charter §7）

## 目的

投稿受付と一覧取得を HTTP で公開し、製品因子（検証・永続化呼び出し・匿名化）を関数としてつなぐ。

## Recognition

| 認識単位 | 一文 |
|----------|------|
| HTTP API 枠 | SYS1/SYS2 の入出力ポート（ブラウザ ↔ Store） |

## Factors（API に載せる）

| 因子 | 種別 | エンドポイント案 |
|------|------|------------------|
| 入力を受ける · 検証する · 永続化する | SYS1 | `POST /stories` |
| 一覧を読み出す · 匿名化する | SYS2 | `GET /stories` |
| authorKey を付与する | function | ミドルウェア（Cookie / ヘッダ）→ SYS1 |

レスポンスの一覧項目から `authorKey` / 属性を落とす（匿名化はサーバ側で行い、UI に生データを渡さない — feed-reading 推奨 A）。

## モジュール境界

```text
Hono app
  ├─ middleware: ensureAuthorKey
  ├─ POST /stories  → validate → persist → 201 { id, createdAt, body, situation?, cause? }
  └─ GET  /stories  → list(order=createdAt desc) → anonymize → 200 { items: [...] }
```

メッセージ `FailureStoryPersisted` は同プロセス内の関数呼び出し／後で Queue に置換可能なフックとして残す（今は同期で可）。

## 境界・非目的

- **含む**: S1 の 2 エンドポイント + authorKey ミドルウェア
- **含まない**: 認証プロバイダ本接続 · GraphQL 必須化 · リアクション API（S2）

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
