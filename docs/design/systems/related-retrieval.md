---
title: H2 システム — 関連失敗検索（SYS4）
kind: design
phase: P3
scope_level: H2
status: agreed
agreed_at: "2026-10-15"
system_id: SYS4
slice: S3
related_h2: docs/design/systems/failure-share-h2.md
related_elements:
  - docs/design/elements/related-failure.md
  - docs/design/elements/failure-story.md
  - docs/design/elements/limited-reaction.md
related_requirements: docs/requirements/failure-share/要件.md
created: "2026-10-15"
updated: "2026-10-15"
---

# System — 関連失敗検索 · SYS4

親: [failure-share-h2](failure-share-h2.md)  
H1: [related-failure](../elements/related-failure.md)（E6）  
要件: FR10

## 目的

指定投稿をクエリに、他投稿を類似スコアで並べ top-K を匿名化して返す。

## Recognition

| 認識単位 | 一文 |
|----------|------|
| 関連失敗検索システム | E6 の照会・採点・提示境界 |

## Factors

| 因子 | 種別 | メモ |
|------|------|------|
| tokenizeForSimilarity | function | 空白・句読点分割 · 2文字以上 |
| scoreStorySimilarity | function | Jaccard |
| findRelatedStories | function | 自己除外 · top 3 · wakaru ブースト |
| anonymize + public counts | function | SYS2/SYS3 既存を再利用 |

## データフロー

```text
GET /stories/:id/related
  → load query story (404 if missing)
  → list candidates from Store
  → tokenize · Jaccard · + wakaruBoost
  → top 3 exclude self
  → anonymize + counts { wakaru, reference }
  → 200 { items }
```

後段: `findRelatedStories` 内を Vectorize クエリに置換（本システム境界は維持）。

## 境界・非目的

- **含む**: 関連 API · 簡易類似 · 公開マスク
- **含まない**: ベクトル DB 本接続 · モデレーション · E5 本実装

## エージェント提案

| 案 | 概要 | 推奨 |
|----|------|------|
| A | 上記パイプライン | **推奨** |

**推奨: A**

## 次

- [x] agreed
- [ ] H3/H4 · P5
