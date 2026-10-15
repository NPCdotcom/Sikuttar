---
title: S0 — S1 実行足場（Worker · Hono · D1 · Vite React）
kind: plan
status: agreed
agreed_at: "2026-10-15"
scope_level: program
pdca_class: S0
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
  framework: docs/design/frameworks/cloudflare-platform.md
---

# S0 — S1 実行足場

Semantics: [docs/DESIGN_SEMANTICS.md](../../docs/DESIGN_SEMANTICS.md)  
**Do unit** = 足場因子の最小セット（実装コードの class 階層ではない）。

## Goal

SYS1/SYS2 / FW1–FW3 を載せるリポジトリ足場を作り、ローカルで Worker（Hono）と Vite React を起動できる状態にする。

## Scope hierarchy（確定済み上位）

| Level | Path | Status |
|-------|------|--------|
| H0 product | docs/design/product/charter.md | agreed |
| H1 element | docs/design/elements/failure-story.md 等 S1 | agreed |
| H2 system | docs/design/systems/failure-share-h2.md | agreed |
| H3 framework | docs/design/frameworks/failure-share-h3.md | agreed |
| H4 program | docs/design/programs/*-pipeline.md · browser-shell | agreed |
| H4/H5 this | （this plan · S0 scaffold） | draft |

## Factors in this plan

| Factor | Kind | Recognition it supports |
|--------|------|-------------------------|
| bindWorkerHono | function | FW2/FW3 実行枠 |
| bindD1EmptySchema | function / property | Store（失敗談テーブル空） |
| placeViteReactApp | function | FW1 配置 |
| runLocalDev | action | ローカル起動確認 |

## Scope

### In scope

- Cloudflare Worker + Hono エントリ
- D1 バインディングと空（または id/body/… 列のみ）のマイグレーション
- Vite + React アプリ配置（画面はプレースホルダ可）
- ローカル `wrangler` / `vite` 起動手順の記録

### Out of scope

- POST/GET の本実装（後続 plan）
- 本番デプロイ必須化 · RAG · リアクション

## Acceptance criteria（S0: ≤2）

- [x] factor `bindWorkerHono` + `bindD1EmptySchema`: Worker が起動し D1 に接続できる
- [x] factor `placeViteReactApp` + `runLocalDev`: Vite React がローカルで表示できる

## Dependencies

- H3 agreed（React · Hono · Cloudflare/D1）
- 後続: persist-failure-story · list-anonymized-feed

## Facts

- リポジトリにアプリソースは未作成（本 plan で足場を置く）

## Assumptions

- スタック: TypeScript · React · Hono · Cloudflare（charter §7）

## Open questions

- モノレポ vs `apps/web` + `apps/api` 配置 → **apps/web + worker ルート** で進める

## Agent recommendations（計画時）

| 案 | 概要 | 推奨度 |
|----|------|--------|
| A | Worker(Hono+D1) + Vite SPA を同リポ | 高 |
| B | Pages Functions のみ | 中 |

**推奨**: A

## User thinking（推敲）

> 

## Progress assessments

| Date | Verdict | Summary |
|------|---------|---------|
| 2026-10-15 | on_track | plan draft |

## PDCA log

| Date | Phase | Note | Commit |
|------|-------|------|--------|
| 2026-10-15 | Plan | S0 scaffold agreed | |
| 2026-10-15 | Do | AC green · Worker health + Vite build | |
| 2026-10-15 | Check | P6 conditional · docs/reviews/s1-mvp-p6.md | |
| 2026-10-15 | Act | Conditional Go accepted by user | |
