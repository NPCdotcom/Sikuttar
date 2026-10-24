---
title: H4 program — フィード閲覧パイプライン
kind: design
phase: P3
scope_level: H4
status: agreed
agreed_at: "2026-10-15"
related_requirements: docs/requirements/failure-share/要件.md
parent_element: docs/design/elements/feed.md
parent_system: docs/design/systems/feed-reading.md
parent_framework: docs/design/frameworks/hono-api.md
created: "2026-10-15"
updated: "2026-10-15"
---

# Program — フィード閲覧パイプライン

Semantics: recognition / classification / spec (kit local)  
H2: [feed-reading](../systems/feed-reading.md)（SYS2）· H1: [anonymous-display](../elements/anonymous-display.md)

## 目的（どの H1/H2 のためか）

永続化済み失敗談を新着順で読み出し、匿名化して API 応答にする（FR2 · FR4）。

## 責務・境界

- **含む**: `GET /stories` 経路の list → anonymize
- **含まない**: 投稿永続化 · ブラウザ描画（browser-shell）· E5 優先度本実装

## Recognition

| 認識単位 | 何を包含するか |
|----------|----------------|
| フィード閲覧パイプライン | SYS2 の読み出しと匿名化の実行単位 |

## Factors

| 因子 | 種別 | メモ |
|------|------|------|
| listByCreatedAtDesc | function | D1 · createdAt 降順 |
| anonymizeForDisplay | function | authorKey · 属性を除去。身元ラベル無し |
| （フック）sortByDisplayPriority | function | E5 · 未接続 |

## 公開インターフェース / API

`GET /stories`  
Response 200: `{ items: [{ id, createdAt, body, situation?, cause? }] }`

## 依存（H3）

- Hono（FW2）· D1（FW3）

## エージェント提案

**推奨**: 匿名化はサーバ側で行い、UI に生 authorKey を渡さない。

## Open questions

- limit / ページング → 実装時仮値（非ブロッカー）

## 次

- Plan: `.agents/plans/algorithms/list-anonymized-feed.md`
