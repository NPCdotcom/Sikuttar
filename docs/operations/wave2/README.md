---
title: Wave2 operations — index
kind: operations
slice: wave2
related_issue: "https://github.com/NPCdotcom/Sikuttar/issues/11"
created: "2026-10-17"
updated: "2026-10-18"
---

# Wave2 運用（インフラ）

Issue [#11](https://github.com/NPCdotcom/Sikuttar/issues/11) · 方針の正本: [ADR 0001](../../adr/0001-cloudflare-semantic-search-cost.md)

| 文書 | 用途 |
|------|------|
| [deploy-boundary.md](./deploy-boundary.md) | CF デプロイ Go / No-Go チェックリスト |
| [oauth-github-setup.md](./oauth-github-setup.md) | GitHub OAuth App · env 契約 · 本番 secrets |
| [vectorize-paid-gate.md](./vectorize-paid-gate.md) | Workers Paid / Vectorize 本番オン直前ゲート |
| [gen-llm-gate.md](./gen-llm-gate.md) | 生成 LLM 載せる直前ゲート（ADR 0002 維持） |
| [prod-smoke.md](./prod-smoke.md) | 本番スモーク手順（共同者向け） |

**いま（2026-10-18）**: ローカルデモ **Pass** · **Free 初回公開 Go（方針 A）** — Workers + D1 · Jaccard · 質問テンプレ。Workers Paid / Vectorize / 生成 LLM は **次ゲート**（契約・オンしない）。
