---
title: Wave2 — Cloudflare デプロイ境界
kind: operations
slice: wave2
related_adr: docs/adr/0001-cloudflare-semantic-search-cost.md
created: "2026-10-17"
updated: "2026-10-18"
---

# Cloudflare デプロイ境界（運用）

親決定: [ADR 0001](../../adr/0001-cloudflare-semantic-search-cost.md)

## 原則

- ローカル（D1 local · `SEMANTIC_SEARCH=fallback`）で足りる間は **頻繁に CF へ上げない**
- 初回公開は **wave2 デモ一式が揃ってからまとめて** 行う
- **初回波 = Cloudflare Free**（Workers + D1 · Jaccard · 質問テンプレ）。Workers Paid / Vectorize / 生成 LLM は別ゲート

## Go / No-Go

| 状態 | 判定 | 行動 |
|------|------|------|
| 画面・API がローカルだけで検証可能（フォールバック検索含む） | **No-Go** | `wrangler deploy` しない（極まれな疎通確認のみ可） |
| ユーザー明示の Free 初回公開 Go · デモ一式ローカル Pass | **Go（Free 初回公開）** | D1 remote · SPA assets · OAuth 本番 Callback · `SEMANTIC_SEARCH=fallback` · `SECRETARY_QA=on` で deploy |
| 意味検索を本番フラグでオンにする直前 | **Paid ゲート** | [vectorize-paid-gate.md](./vectorize-paid-gate.md) |
| 講義向け生成 LLM を載せる直前 | **生成 LLM ゲート** | [gen-llm-gate.md](./gen-llm-gate.md) |

## ローカル受け入れゲート（2026-10-18）

| 項目 | 判定 |
|------|------|
| #2–#10 相当がローカルでデモ可能（認証・検索 fallback・タグ・ブックマーク） | **Pass** |
| 質問（E12 · テンプレ）ローカルデモ | **Pass** |
| CF Free 初回デプロイ判定 | **Go（方針 A · 2026-10-18）** — Paid / Vectorize / 生成 LLM はオンしない |

## 初回公開前チェック（Free · 方針 A）

- [x] #2–#10 相当がローカルでデモできる（2026-10-18 受け入れ）
- [x] `SEMANTIC_SEARCH=fallback`（Vectorize オンは別ゲート）
- [x] `SECRETARY_QA=on`（テンプレのみ · ADR 0002 · 生成 LLM なし）
- [x] SPA を同一 Worker origin で配信（`[assets]` · Cookie ホスト分裂回避）
- [x] Vectorize / `[ai]` バインディングはコメントのまま
- [x] OAuth 本番 Callback · Worker `redirect_uri` 検証済み（2026-10-18 · `/auth/github` → GitHub authorize · `https://sikuttar.npcdotcom.workers.dev/auth/github/callback`）。GitHub OAuth App 側に同 URL が無い場合は App 設定で追加すること
- [x] remote D1 `database_id` が実値（`wrangler.toml`）
- [x] `wrangler secret put` で OAuth secrets 投入済み（2026-10-18）
- [x] `wrangler deploy` 完了 · https://sikuttar.npcdotcom.workers.dev
- [x] README / 本ディレクトリの手順と矛盾しない

## デプロイコマンド（Free）

```bash
npm run build:web
npx wrangler d1 migrations apply sikuttar --remote
npm run deploy
```

公開後: `https://sikuttar.<account>.workers.dev`（またはカスタム）でフィード・投稿・検索（Jaccard）・質問（テンプレ）・プロフィールを確認。

## やらない（日常 · 本波）

- 機能ごと・コミットごとの本番デプロイ
- Workers Paid 契約 · Vectorize · Workers AI 生成
- R2 / Queues / AI Search
