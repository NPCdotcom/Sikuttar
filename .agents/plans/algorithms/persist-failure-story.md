---
title: S1 — 失敗談を検証・永続化する
kind: plan
status: agreed
agreed_at: "2026-10-15"
scope_level: algorithm
pdca_class: S1
pdca_eligible: true
created: "2026-10-15"
updated: "2026-10-15"
related_design: docs/design/programs/story-posting-pipeline.md
related_requirements: docs/requirements/failure-share/要件.md
unit_scope: docs/design/programs/story-posting-pipeline.md
parent_hierarchy:
  product: docs/design/product/charter.md
  element: docs/design/elements/failure-story.md
  system: docs/design/systems/story-posting.md
  framework: docs/design/frameworks/hono-api.md
---

# S1 — 失敗談を検証・永続化する

Semantics: [docs/DESIGN_SEMANTICS.md](../../docs/DESIGN_SEMANTICS.md)  
**Default Do unit** = factor（validateBody · attachAuthorKey · persistFailureStory）。

## Goal

`POST /stories` で失敗談本文を受け取り、任意の状況・原因を許しつつ D1 に永続化する（FR1 · FR3）。

## Scope hierarchy（確定済み上位）

| Level | Path | Status |
|-------|------|--------|
| H0 product | docs/design/product/charter.md | agreed |
| H1 element | docs/design/elements/failure-story.md | agreed |
| H2 system | docs/design/systems/story-posting.md | agreed |
| H3 framework | docs/design/frameworks/hono-api.md · cloudflare-platform.md | agreed |
| H4 program | docs/design/programs/story-posting-pipeline.md | agreed |
| H5 algorithm | （this plan） | draft |

## Factors in this plan

| Factor | Kind | Recognition it supports |
|--------|------|-------------------------|
| validateBody | function | E1 失敗談 |
| attachAuthorKey | function | E8/E7 内部キー |
| persistFailureStory | function | E1 永続化 |

## Scope

### In scope

- 本文必須検証 · situation?/cause? 空許可
- Cookie 由来 authorKey 付与（UI 非表示）
- D1 への INSERT · 201 応答（authorKey をレスポンスに含めない）

### Out of scope

- GET 一覧 · UI · リアクション

## Acceptance criteria（S1: ≤5 · 因子単位）

- [x] factor `validateBody`: 空 body は 4xx。situation/cause 欠落でも成功しうる
- [x] factor `attachAuthorKey`: リクエストに内部 authorKey が付き、レスポンス JSON に出ない
- [x] factor `persistFailureStory`: 再取得可能な id で D1 に残る（FR1）
- [x] 組み合わせ: 本文のみ投稿が通る（FR3）

## Dependencies

- `.agents/plans/programs/s1-scaffold.md` 完了（または同時足場）

## Facts

- H4 story-posting-pipeline agreed

## Assumptions

- Cookie セッションで authorKey を持てる

## Open questions

- 文字数上限の具体値 → Do 時に仮定数

## Agent recommendations（計画時）

**推奨**: 3 因子を関数として登録し、ハンドラは組み合わせのみ。

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
| 2026-10-15 | Do | POST /stories · factors green | |
| 2026-10-15 | Check | P6 conditional · docs/reviews/s1-mvp-p6.md | |
| 2026-10-15 | Act | Conditional Go accepted by user | |
