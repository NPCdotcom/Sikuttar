---
title: H3 フレームワーク — エッジ実行基盤（Cloudflare）· FW3
kind: design
phase: P3
scope_level: H3
status: agreed
agreed_at: "2026-10-15"
framework_id: FW3
slice: S1
related_h3: docs/design/frameworks/failure-share-h3.md
related_systems:
  - docs/design/systems/story-posting.md
  - docs/design/systems/feed-reading.md
created: "2026-10-15"
updated: "2026-10-15"
---

# Framework — エッジ実行基盤（Cloudflare）· FW3

親: [failure-share-h3](failure-share-h3.md)  
支える: Hono ホスト · Store · セッション相当（authorKey）  
Assumption: Cloudflare（charter §7）

## 目的

SYS1 の永続化と authorKey 保持、SYS2 の読み出しを載せる実行・ストレージ基盤を選ぶ。

## Recognition

| 認識単位 | 一文 |
|----------|------|
| エッジ実行基盤 | Workers 上で API を動かし、Store とセッション手段を提供する枠 |

製品オブジェクトではない。後段 RAG も「同基盤上の追加」として拡張しうる（今は未実装）。

## Factors（基盤に載せる）

| 因子 | 種別 | メモ |
|------|------|------|
| API を実行する | function | Workers 上の Hono |
| 永続化する / 一覧する | function | Store バインディング |
| authorKey を保持する | property / function | Cookie 等（ログイン UI なし） |

## Store 選択肢（S1）

| 案 | 概要 | 向く状況 |
|----|------|----------|
| A（推奨） | **D1**（SQL）に失敗談テーブル | 構造化レコード · 新着ソートが容易 |
| B | KV に JSON 配列／個別キー | 極小プロト向け · 一覧が脆い |
| C | Durable Objects | 協調が要る後段向け · S1 には重い |

**推奨: A（D1）** — FR1/FR2 の検証がしやすい。

## モジュール境界

```text
Cloudflare Worker (Hono)
  ├─ env.DB (D1)     → stories / accounts / reactions
  └─ Cookie session  → authorKey
（任意）静的資産: Workers Assets / Pages で FW1 配信
```

## 境界・非目的

- **含む**: Workers · D1（推奨）· Cookie ベース authorKey · reactions · D1 上の簡易類似（S3）
- **wave2 提案**: Workers AI 埋め込み · Vectorize（Paid 要否確認）· 意味検索フラグ · OAuth subject 紐づけ。詳細: [ADR 0001](../../adr/0001-cloudflare-semantic-search-cost.md) · [semantic-search](../elements/semantic-search.md)
- **含まない（S3 時点）**: Vectorize 本接続必須化。**wave2 で有効化を提案**（フォールバック必須）

## エージェント提案

| 案 | 概要 | 推奨 |
|----|------|------|
| A | Worker + D1 + Cookie authorKey · UI は Assets/Pages | **推奨** |
| B | Pages Functions のみに寄せる | 可だが API 境界が分かりにくい場合あり |
| C | ローカル Express + SQLite を正とする | 発表デプロイと乖離 → 開発補助に留め正本は CF |

**推奨: A**

## Open questions

- [x] Worker + D1 + Cookie authorKey でよいか → **yes**
- UI 配信（Assets vs Pages）→ P4 で仮決め可

## 次

- [x] 合意 → agreed
- [ ] P4: schema / bindings の program
