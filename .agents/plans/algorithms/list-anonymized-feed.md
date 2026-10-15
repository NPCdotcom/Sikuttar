---
title: S1 — 失敗談を新着順で匿名一覧する
kind: plan
status: agreed
agreed_at: "2026-10-15"
scope_level: algorithm
pdca_class: S1
pdca_eligible: true
created: "2026-10-15"
updated: "2026-10-15"
related_design: docs/design/programs/feed-reading-pipeline.md
related_requirements: docs/requirements/failure-share/要件.md
unit_scope: docs/design/programs/feed-reading-pipeline.md
parent_hierarchy:
  product: docs/design/product/charter.md
  element: docs/design/elements/feed.md
  system: docs/design/systems/feed-reading.md
  framework: docs/design/frameworks/hono-api.md
---

# S1 — 失敗談を新着順で匿名一覧する

Semantics: [docs/DESIGN_SEMANTICS.md](../../docs/DESIGN_SEMANTICS.md)

## Goal

`GET /stories` で失敗談を createdAt 降順に返し、authorKey 等の身元を含めない（FR2 · FR4）。

## Scope hierarchy（確定済み上位）

| Level | Path | Status |
|-------|------|--------|
| H0 product | docs/design/product/charter.md | agreed |
| H1 element | docs/design/elements/feed.md · anonymous-display.md | agreed |
| H2 system | docs/design/systems/feed-reading.md | agreed |
| H3 framework | docs/design/frameworks/hono-api.md · cloudflare-platform.md | agreed |
| H4 program | docs/design/programs/feed-reading-pipeline.md | agreed |
| H5 algorithm | （this plan） | draft |

## Factors in this plan

| Factor | Kind | Recognition it supports |
|--------|------|-------------------------|
| listByCreatedAtDesc | function | E2 フィード |
| anonymizeForDisplay | function | E8 匿名表示 |

## Scope

### In scope

- D1 からの一覧（新着降順）
- 応答から authorKey · 属性スロットを除去
- 身元ラベルを付けない

### Out of scope

- UI 描画 · 投稿 · E5 優先度ソート本実装

## Acceptance criteria（S1: ≤5 · 因子単位）

- [x] factor `listByCreatedAtDesc`: 複数件が新しい順で返る（FR2）
- [x] factor `anonymizeForDisplay`: 応答 items に authorKey / 氏名相当フィールドが無い（FR4）
- [x] 組み合わせ: 永続化済み投稿が GET で読める

## Dependencies

- s1-scaffold
- 検証しやすいよう persist-failure-story と併用推奨

## Facts

- 表示表記は空／非表示（S1 element agreed）

## Assumptions

- Store に失敗談行が存在する（手動 INSERT または persist plan）

## Open questions

- limit 既定値 → Do 時（例: 50）

## Agent recommendations（計画時）

**推奨**: list と anonymize を分離し、後で sort フックを差し替え可能にする。

## User thinking（推敲）

> 

## Progress assessments

| Date | Verdict | Summary |
|------|---------|---------|
| 2026-10-15 | on_track | plan draft |

## PDCA log

| Date | Phase | Note | Commit |
|------|-------|------|--------|
| 2026-10-15 | Plan | agreed | |
| 2026-10-15 | Do | GET /stories · anonymize green | |
| 2026-10-15 | Check | P6 conditional · docs/reviews/s1-mvp-p6.md | |
| 2026-10-15 | Act | Conditional Go accepted by user | |
