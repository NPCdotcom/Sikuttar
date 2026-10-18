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
| [oauth-github-setup.md](./oauth-github-setup.md) | GitHub OAuth App · env 契約 |
| [vectorize-paid-gate.md](./vectorize-paid-gate.md) | Workers Paid / Vectorize 本番オン直前ゲート |

**いま（2026-10-18）**: ローカルデモ受け入れ **Pass**（子 Issue #2–#10 完了 · `SEMANTIC_SEARCH=fallback`）。初回 CF デプロイと Vectorize / Paid は **次ゲート**（ユーザー明示の Go まで上げない）。
