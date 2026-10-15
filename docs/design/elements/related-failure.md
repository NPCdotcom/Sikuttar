---
title: H1 要素 — 関連失敗の提示（RAG · 後段）
kind: design
phase: P3
scope_level: H1
status: agreed
agreed_at: "2026-10-15"
slice: S3
element_id: E6
related_product: docs/design/product/charter.md
related_h1: docs/design/elements/failure-share-h1.md
related_requirements: docs/requirements/failure-share/要件.md
created: "2026-10-15"
updated: "2026-10-15"
---

# Element — 関連失敗の提示 · E6

親: [failure-share-h1](failure-share-h1.md) · charter §8「関連失敗の提示」  
要件: FR10

## 目的

蓄積済み失敗談から、ある投稿に近い／関連する他投稿を提示する入口を置く。S3 は D1 上の簡易類似で動かし、後段で Vectorize／Workers AI に差し替え可能にする。

## Recognition

| 認識単位 | 一文 |
|----------|------|
| 関連失敗の提示 | 蓄積失敗談からの類似／関連提示（RAG 本線の入口） |

## Factors

| 因子 | 種別 | メモ |
|------|------|------|
| 類似を照会する | function | `findRelatedStories` |
| トークン化する | function | `tokenizeForSimilarity` |
| 類似を採点する | function | Jaccard · `scoreStorySimilarity` |
| 提示する | action | UI／API で top-K |
| わかる信号でブースト | function | 公開 wakaru 件数の微小加算（定数仮） |

## 境界・非目的

- **含む**: `GET /stories/:id/related` · 自己除外 · top 3 · 匿名公開形
- **含まない**: Vectorize／Workers AI 本接続 · E5 優先度ソート本実装 · コメントスレ
- **差し替えフック**: `findRelatedStories` の内部を後でベクトル検索に置換（ポートは維持）

## メッセージ／拡張

| メッセージ | 意味 |
|------------|------|
| `RelatedRetrieved` | 関連一覧取得完了 |

## エージェント提案

| 案 | 概要 | 推奨 |
|----|------|------|
| A | D1 Jaccard + wakaru ブースト · Vectorize は文書化のみ | **推奨**（選択 1） |
| B | スタブのみ | FR10 最低限だがデモ弱い |
| C | Vectorize 本接続 | 設定負荷大 |

**推奨: A** · **決定: A**

## Open questions

- [x] top-K=3 でよいか → **yes**
- 埋め込みモデル選定 → 後段（Open）

## 次

- [x] agreed
- [ ] SYS4 · P4/P5
