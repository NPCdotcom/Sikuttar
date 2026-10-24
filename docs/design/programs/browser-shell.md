---
title: H4 program — ブラウザシェル（投稿・フィード UI）
kind: design
phase: P3
scope_level: H4
status: agreed
agreed_at: "2026-10-15"
related_requirements: docs/requirements/failure-share/要件.md
parent_element: docs/design/elements/feed.md
parent_system: docs/design/systems/feed-reading.md
parent_framework: docs/design/frameworks/react-ui.md
created: "2026-10-15"
updated: "2026-10-15"
---

# Program — ブラウザシェル

Semantics: recognition / classification / spec (kit local)  
H3: [react-ui](../frameworks/react-ui.md) · API: story-posting / feed-reading pipelines

## 目的（どの H1/H2 のためか）

ブラウザで失敗談を投稿し、匿名化されたフィードを見て、投稿→閲覧の一続きデモを成立させる（NFR2）。

## 責務・境界

- **含む**: 投稿フォーム · フィード一覧描画 · API 呼び出し
- **含まない**: ログイン UI · リアクション · サーバ側永続化ロジック本体

## Recognition

| 認識単位 | 何を包含するか |
|----------|----------------|
| ブラウザシェル | FW1 上の S1 画面（compose + feed） |

## Factors

| 因子 | 種別 | メモ |
|------|------|------|
| composeAndSubmit | action | body 必須 · situation?/cause? → POST /stories |
| renderFeed | action | GET /stories → 身元ラベル無しで描画 |
| refreshAfterSubmit | action | 投稿後に一覧を更新（手動デモ用） |

## 公開インターフェース / API

- 消費: `POST /stories` · `GET /stories`
- 描画項目: body · situation? · cause? · createdAt のみ

## 依存（H3）

- Vite + React SPA（FW1）· 同ドメインまたはプロキシで Hono（FW2）

## エージェント提案

**推奨**: 単一ページにフォーム＋一覧。グローバル状態ライブラリは必須にしない。

## Open questions

- ルーティング不要（単一ページ）で進める

## 次

- Plan: `.agents/plans/programs/ui-compose-and-feed.md`
