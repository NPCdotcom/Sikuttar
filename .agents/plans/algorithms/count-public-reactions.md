---
title: S2 — 公開リアクション件数を集計する
kind: plan
status: agreed
agreed_at: "2026-10-15"
scope_level: algorithm
pdca_class: S2
pdca_eligible: true
created: "2026-10-15"
updated: "2026-10-15"
related_design: docs/design/programs/reaction-pipeline.md
related_requirements: docs/requirements/failure-share/要件.md
unit_scope: docs/design/programs/reaction-pipeline.md
parent_hierarchy:
  product: docs/design/product/charter.md
  element: docs/design/elements/limited-reaction.md
  system: docs/design/systems/reaction-signaling.md
  framework: docs/design/frameworks/hono-api.md
---

# S2 — 公開リアクション件数を集計する

## Goal

`GET /stories` の各 item に `counts: { wakaru, reference }` のみを付ける（FR5 · FR7）。

## Factors

| Factor | Kind |
|--------|------|
| countPublicReactions | function |
| maskBadFromPublic | function |

## Acceptance criteria

- [x] counts に `bad` キーが無い
- [x] bad 行が DB にあっても公開件数に混ざらない
