---
title: H1 要素 — 意味検索照会
kind: design
phase: P3
scope_level: H1
status: agreed
slice: wave2
element_id: E9
related_product: docs/design/product/charter.md
related_h1: docs/design/elements/failure-share-h1.md
related_requirements: docs/requirements/failure-share/要件-wave2.md
created: "2026-10-17"
agreed_at: "2026-10-17"
updated: "2026-10-17"
---

# Element — 意味検索照会 · E9

要件: FR11 · FR12 · NFR5–NFR7

## 目的

クエリ文に意味的に近い失敗談を返す。S3 の関連提示（特定 ID 起点）と違い、**自由クエリ起点**。

## Recognition

| 認識単位 | 一文 |
|----------|------|
| 意味検索照会 | クエリを埋め込み、ベクトル近傍の失敗談を返す照会 |

## Factors

| 因子 | 種別 | メモ |
|------|------|------|
| クエリを埋め込む | function | Workers AI |
| 近傍を検索する | function | Vectorize |
| 結果を匿名化する | function | authorKey / 属性を落とす |
| フォールバック検索する | function | D1 Jaccard / LIKE（未バインド時） |
| 投稿を索引する | function | persist 後に upsert |

## 境界

- **含む**: 検索 API · 索引更新 · フラグ切替
- **含まない**: LLM 長文生成必須化 · 身元つき結果
- **E6 との差**: E6 = 投稿 ID 起点の関連。E9 = クエリ起点の検索。実装は共有しうるが認識は分ける

## CF 配置（推奨）

```text
POST /search { q }
  → embed(q) via Workers AI
  → Vectorize.query
  → hydrate from D1 → anonymize → { items }

on FailureStoryPersisted
  → embed(story text) → Vectorize.upsert(id)
```

フォールバック: `SEMANTIC_SEARCH=fallback` で tokenize/Jaccard（既存 S3 factors 再利用可）。

## デプロイ境界

ローカルはフォールバックで開発。Vectorize 本番オン＋CF 公開は **wave2 がまとめてデモ可能になった時点**（[ADR 0001](../../adr/0001-cloudflare-semantic-search-cost.md)）。

## 決定

**A Vectorize + Workers AI + fallback**（2026-10-17 agreed）。
