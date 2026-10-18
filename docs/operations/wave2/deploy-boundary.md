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

## Go / No-Go

| 状態 | 判定 | 行動 |
|------|------|------|
| 画面・API がローカルだけで検証可能（フォールバック検索含む） | **No-Go** | `wrangler deploy` しない（極まれな疎通確認のみ可） |
| GitHub OAuth · タグ · ブックマーク · 意味検索本番経路がデモ可能 | **Go（初回公開）** | D1 remote · バインディング · OAuth 本番 Callback をまとめて設定してデプロイ |
| 意味検索を本番フラグでオンにする直前 | **Paid ゲート** | [vectorize-paid-gate.md](./vectorize-paid-gate.md) |

## ローカル受け入れゲート（2026-10-18）

| 項目 | 判定 |
|------|------|
| #2–#10 相当がローカルでデモ可能（認証・検索 fallback・タグ・ブックマーク） | **Pass** |
| CF デプロイ判定 | まだ **No-Go**（ローカルで足りる · ユーザー明示の Go まで上げない） |
| 次アクション | 初回公開前チェックの残り（本番 Callback · remote D1 実 ID 等）を満たしてからまとめて deploy |

## 初回公開前チェック（まとめて Go のとき）

- [x] #2–#10 相当がローカルでデモできる（2026-10-18 受け入れ）
- [ ] OAuth 本番 Callback URL を GitHub App に追加済み
- [ ] remote D1 `database_id` が実値（プレースホルダではない）
- [ ] `SEMANTIC_SEARCH` 初期値は当面 `fallback` でも可（Vectorize オンは別ゲート）
- [ ] README / 本ディレクトリの手順と矛盾しない

## やらない（日常）

- 機能ごと・コミットごとの本番デプロイ
- 未完成 OAuth / 検索を本番フラグで公開オン
