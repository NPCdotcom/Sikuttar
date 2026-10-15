---
title: S2 — リアクションを検証・永続化する
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

# S2 — リアクションを検証・永続化する

## Goal

`POST /stories/:id/reactions` で kind を検証し D1 に永続化する（FR5 · FR7 内部 BAD 含む）。

## Factors

| Factor | Kind |
|--------|------|
| validateReactionKind | function |
| persistReaction | function |

## Acceptance criteria

- [x] `wakaru` / `reference` / `bad` 以外は 4xx
- [x] UNIQUE(story_id, author_key, kind) で同種二重は拒否または no-op
- [x] 応答 JSON に authorKey を出さない · bad 件数を公開一覧に載せない
