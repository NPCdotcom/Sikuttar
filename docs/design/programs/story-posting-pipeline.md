---
title: H4 program — 失敗談投稿パイプライン
kind: design
phase: P3
scope_level: H4
status: agreed
agreed_at: "2026-10-15"
related_requirements: docs/requirements/failure-share/要件.md
parent_element: docs/design/elements/failure-story.md
parent_system: docs/design/systems/story-posting.md
parent_framework: docs/design/frameworks/hono-api.md
created: "2026-10-15"
updated: "2026-10-15"
---

# Program — 失敗談投稿パイプライン

Semantics: recognition / classification / spec (kit local)  
H2: [story-posting](../systems/story-posting.md)（SYS1）· H3: [hono-api](../frameworks/hono-api.md) · [cloudflare-platform](../frameworks/cloudflare-platform.md)

## 目的（どの H1/H2 のためか）

E1 失敗談を受け取り、検証・authorKey 付与のうえ D1 に永続化する（FR1 · FR3）。

## 責務・境界

- **含む**: `POST /stories` 経路の因子列
- **含まない**: フィード描画 · 匿名化の一覧適用（feed-reading-pipeline）· UI フォーム（browser-shell）

## Recognition

| 認識単位 | 何を包含するか | メモ |
|----------|----------------|------|
| 失敗談投稿パイプライン | SYS1 の検証→付与→永続化の実行単位 | ≠ 必須 class |

## Factors

| 因子 | 種別 | 組み合わせ相手 |
|------|------|----------------|
| validateBody | function | body 必須 · situation?/cause? 任意 |
| attachAuthorKey | function | Cookie セッション（認証 B） |
| persistFailureStory | function | D1 |
| emitFailureStoryPersisted | action / message | 同期フック可 |

## 公開インターフェース / API

`POST /stories`  
Request: `{ body: string, situation?: string, cause?: string }`  
Response 201: `{ id, createdAt, body, situation?, cause? }`（authorKey は返さない）

## 依存（H3）

- Hono（FW2）· Cloudflare Worker + D1 + Cookie（FW3）

## エージェント提案

**推奨**: 因子を純関数＋ Store port で並べ、クラス階層にしない。

## Open questions

- 文字数上限 → 実装時の仮上限（非ブロッカー）

## 次

- Plan: `.agents/plans/algorithms/persist-failure-story.md`
