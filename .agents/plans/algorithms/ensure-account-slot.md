---
title: S1 — アカウント属性スロットを確保する（FR8）
kind: plan
status: agreed
agreed_at: "2026-10-15"
scope_level: algorithm
pdca_class: S1
pdca_eligible: true
created: "2026-10-15"
updated: "2026-10-15"
related_design: docs/design/elements/anonymous-display.md
related_requirements: docs/requirements/failure-share/要件.md
unit_scope: docs/design/elements/anonymous-display.md
parent_hierarchy:
  product: docs/design/product/charter.md
  element: docs/design/elements/anonymous-display.md
  system: docs/design/systems/story-posting.md
  framework: docs/design/frameworks/cloudflare-platform.md
---

# S1 — アカウント属性スロットを確保する（FR8）

## Goal

`author_key` に紐づくアカウント属性スロット（初期 null）を保持し、公開 UI/API には出さない（FR8）。

## Factors in this plan

| Factor | Kind | Recognition |
|--------|------|-------------|
| ensureAccountSlot | function | E7 アカウント属性 |

## Acceptance criteria

- [x] factor `ensureAccountSlot`: 投稿時に `accounts` 行が作られ、occupation / attributes_json は NULL でよい
- [x] 公開 `GET /stories` / UI に occupation・attributes が出ない
- [x] migration `0002_accounts.sql` がローカル適用できる

## Scope

### In scope

- `accounts` テーブル · POST 時の枠確保

### Out of scope

- 属性入力 UI · 表示 · 本格ログイン

## PDCA log

| Date | Phase | Note | Commit |
|------|-------|------|--------|
| 2026-10-15 | Plan | FR8 hotfix agreed | |
| 2026-10-15 | Do | accounts migration · ensureAccountSlot · POST wired | |
| 2026-10-15 | Check | FR8 closed · see docs/reviews/s1-mvp-p6.md | |
| 2026-10-15 | Act | Conditional Go accepted by user | |
