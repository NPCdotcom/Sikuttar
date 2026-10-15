---
title: S3 — 関連失敗を採点・選定する
kind: plan
status: agreed
agreed_at: "2026-10-15"
scope_level: algorithm
pdca_class: S3
pdca_eligible: true
created: "2026-10-15"
updated: "2026-10-15"
related_design: docs/design/programs/related-pipeline.md
related_requirements: docs/requirements/failure-share/要件.md
unit_scope: docs/design/programs/related-pipeline.md
parent_hierarchy:
  product: docs/design/product/charter.md
  element: docs/design/elements/related-failure.md
  system: docs/design/systems/related-retrieval.md
  framework: docs/design/frameworks/hono-api.md
---

# S3 — 関連失敗を採点・選定する

## Goal

`GET /stories/:id/related` で自己除外・Jaccard・wakaru ブーストにより top 3 を返す（FR10）。

## Factors

| Factor | Kind |
|--------|------|
| tokenizeForSimilarity | function |
| scoreStorySimilarity | function |
| findRelatedStories | function |

## Acceptance criteria

- [x] クエリ自身は結果に含まれない
- [x] 最大 3 件 · 公開形に bad / authorKey なし
- [x] トークン重複が高い候補が上位になる（UT）

## Branch

`plan/s3-related-failures`
