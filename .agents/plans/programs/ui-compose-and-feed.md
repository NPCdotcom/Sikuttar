---
title: S1 — 投稿フォームとフィード UI
kind: plan
status: agreed
agreed_at: "2026-10-15"
scope_level: program
pdca_class: S1
pdca_eligible: true
created: "2026-10-15"
updated: "2026-10-15"
related_design: docs/design/programs/browser-shell.md
related_requirements: docs/requirements/failure-share/要件.md
unit_scope: docs/design/programs/browser-shell.md
parent_hierarchy:
  product: docs/design/product/charter.md
  element: docs/design/elements/feed.md
  system: docs/design/systems/feed-reading.md
  framework: docs/design/frameworks/react-ui.md
---

# S1 — 投稿フォームとフィード UI

Semantics: [docs/DESIGN_SEMANTICS.md](../../docs/DESIGN_SEMANTICS.md)

## Goal

ブラウザで失敗談を投稿し、匿名フィードで閲覧できる一続きデモを成立させる（NFR2 · FR1–FR4 の UI 面）。

## Scope hierarchy（確定済み上位）

| Level | Path | Status |
|-------|------|--------|
| H0 product | docs/design/product/charter.md | agreed |
| H1 element | failure-story · feed · anonymous-display | agreed |
| H2 system | story-posting · feed-reading | agreed |
| H3 framework | react-ui.md | agreed |
| H4 program | docs/design/programs/browser-shell.md | agreed |
| H4 this | （this plan） | draft |

## Factors in this plan

| Factor | Kind | Recognition it supports |
|--------|------|-------------------------|
| composeAndSubmit | action | E1 投稿 |
| renderFeed | action | E2 フィード · E8 |
| refreshAfterSubmit | action | NFR2 一続き |

## Scope

### In scope

- 単一ページ: フォーム（body 必須 · situation/cause 任意）+ 一覧
- POST/GET /stories 呼び出し
- 身元ラベルを描画しない

### Out of scope

- ログイン画面 · リアクション · ルーティング複雑化

## Acceptance criteria（S1: ≤5 · 因子単位）

- [x] factor `composeAndSubmit`: 本文のみで投稿成功し、situation/cause 空でも可
- [x] factor `renderFeed`: 一覧に本文等が出て、authorKey / 氏名ラベルが無い
- [x] factor `refreshAfterSubmit`: 投稿直後に一覧で当該投稿を確認できる（NFR2）
- [x] 手動デモ: ブラウザのみで投稿→閲覧が一続き（NFR1/NFR2） — README 手順 · UI 実装済

## Dependencies

- s1-scaffold
- persist-failure-story
- list-anonymized-feed

## Facts

- H3: Vite + React SPA

## Assumptions

- API と UI はローカルで同時起動可能

## Open questions

- なし（ブロッカー）

## Agent recommendations（計画時）

**推奨**: 単一ページ・最小状態。ライブラリ追加は必須にしない。

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
| 2026-10-15 | Do | App compose+feed · proxy to API | |
| 2026-10-15 | Check | P6 conditional · docs/reviews/s1-mvp-p6.md | |
| 2026-10-15 | Act | Conditional Go accepted by user | |
