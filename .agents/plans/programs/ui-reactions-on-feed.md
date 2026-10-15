---
title: S2 — フィードに限定リアクション UI
kind: plan
status: agreed
agreed_at: "2026-10-15"
scope_level: program
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
  framework: docs/design/frameworks/react-ui.md
---

# S2 — フィードに限定リアクション UI

## Goal

フィード各投稿に「わかる」「参考になる」のみを付与でき、公開件数が見える（FR5）。コメント入力と BAD ボタンは置かない（FR6 · FR7）。

## Scope

### In scope

- フィード行の 2 ボタン · counts 表示 · POST 後の一覧再取得

### Out of scope

- BAD UI · コメント · 取り消し必須 · 優先度ソート

## Acceptance criteria

- [x] UI にわかる／参考になるのみ（他の自由テキスト反応なし · FR5/FR6）
- [x] 付与後に件数が増えて見える
- [x] BAD 件数・BAD ボタンが公開 UI に無い（FR7）

## Branch

`plan/s2-reactions`（Do 用）

## V-model

| Layer | Check |
|-------|-------|
| UT | factor tests for kind / public counts |
| IT | POST reaction → GET stories counts |
| ST | SYS3 · FW1/FW2 境界 |
| UAT | FR5–FR7 |
