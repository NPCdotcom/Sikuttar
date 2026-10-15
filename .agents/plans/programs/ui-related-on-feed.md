---
title: S3 — フィードに関連失敗を展開する
kind: plan
status: agreed
agreed_at: "2026-10-15"
scope_level: program
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
  framework: docs/design/frameworks/react-ui.md
---

# S3 — フィードに関連失敗を展開する

## Goal

フィード各行から「関連する失敗談」を取得・表示できる（FR10 · コメント UI なし）。

## Acceptance criteria

- [x] ボタンで `GET /stories/:id/related` を呼び一覧下に表示
- [x] BAD・コメント入力は置かない

## Branch

`plan/s3-related-failures`
