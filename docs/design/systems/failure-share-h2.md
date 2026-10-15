---
title: H2 システム概要 — failure-share（S1+S2）
kind: design
phase: P3
scope_level: H2
status: agreed
agreed_at: "2026-10-15"
related_product: docs/design/product/charter.md
related_h1: docs/design/elements/failure-share-h1.md
related_requirements: docs/requirements/failure-share/要件.md
structure_ref: "charter §8 · S1/S2 elements · §7 message-driven"
created: "2026-10-15"
updated: "2026-10-15"
---

# H2 システム概要 — failure-share（S1+S2）

Semantics: [.agents/docs/DESIGN_SEMANTICS.md](../../../.agents/docs/DESIGN_SEMANTICS.md)  
親 H1: [failure-share-h1](../elements/failure-share-h1.md)（agreed）· S1/S2 elements

> **構造ルール**: システムは charter §8 / H1 認識単位を **組み合わせる**。新しい製品語彙ツリーを立てない。スタックは手段（§7 Assumption）。

## 目的

S1（投稿・閲覧・匿名）に続き、S2（限定リアクション・BAD 内部）をメッセージ境界で追加する。

## Recognition（本スライスのシステム）

| ID | システム | 一文 | 合成する H1 |
|----|----------|------|-------------|
| SYS1 | 失敗談投稿システム | 失敗談を受け取り永続化する | E1 · E7/E8（authorKey） |
| SYS2 | フィード閲覧システム | 永続化済み失敗談を匿名化して一覧する | E2 · E8 |
| SYS3 | リアクション信号システム | 限定リアクション付与と BAD 内部記録・公開マスク | E3 · E4 |
| SYS4 | 関連失敗検索システム | 蓄積投稿からの類似／関連提示 | E6 |

S4（表示優先度）は **別システムとして後から関数／購読を追加**する。

## 個別設計

| システム | パス |
|----------|------|
| SYS1 失敗談投稿 | [story-posting.md](story-posting.md) |
| SYS2 フィード閲覧 | [feed-reading.md](feed-reading.md) |
| SYS3 リアクション信号 | [reaction-signaling.md](reaction-signaling.md) |
| SYS4 関連失敗検索 | [related-retrieval.md](related-retrieval.md) |

## データフロー（S1）

```text
[Browser]
   │  submit body (+ optional situation/cause)
   ▼
SYS1 失敗談投稿
   │  attach authorKey (session) · validate · persist
   │  emit FailureStoryPersisted
   ▼
[Store: 失敗談レコード]
   ▲
   │  list by createdAt desc
SYS2 フィード閲覧
   │  map via 匿名化 function（身元ラベル除去）
   ▼
[Browser] 一覧表示（著者ラベルなし）
```

## Factors（システム間）

| 因子 | 種別 | 置き場所 |
|------|------|----------|
| 投稿する · 永続化する | action / function | SYS1 |
| authorKey を付与する | function | SYS1（E8 方針） |
| 一覧する · 新着で並び替える | action / function | SYS2 |
| 匿名化する | function | SYS2（E8） |
| FailureStoryPersisted | message | SYS1 → Store / SYS2 購読可 |
| わかる／参考になるを付与 · 公開件数 | action / function | SYS3（E3） |
| BAD を内部記録 · 公開マスク | function | SYS3（E4） |
| ReactionPersisted | message | SYS3 |
| 類似を照会する · 提示する | function / action | SYS4（E6） |
| RelatedRetrieved | message | SYS4 |

## 境界・非目的

- **含む**: S1–S3（投稿・一覧・リアクション・関連失敗の簡易類似）
- **含まない**: ログイン UI · コメントスレ · BAD 公開 UI/ランキング · Vectorize 本接続 · 優先度スコア本実装（E5）
- **スタック**: Browser + API + Store（Assumption: React / Hono / Cloudflare 系）。製品認識名にはしない

## エージェント提案

| 案 | 概要 | 推奨 |
|----|------|------|
| A | SYS1 / SYS2 の 2 システムに分割（本ドキュメント） | **推奨** — E1 と E2 の境界が残る |
| B | 単一「MVP アプリシステム」に全部まとめる | 速いが後段拡張で肥大化しやすい |
| C | スタック層（CF Worker / D1 等）を H2 の主認識にする | charter 構造から逸脱 → 不採用 |

**推奨: A**

## ユーザー思考

> S1 agreed 。H2 個別設計へ進んで。

## Open questions

- [x] H2 を SYS1 / SYS2 分割でよいか → **yes**
- [x] 個別設計（story-posting · feed-reading）の内容でよいか → **yes**

## 次

- [x] ユーザー確認 → H2 agreed
- [ ] H3 frameworks（任意）または P4 program/plan（MVP）
