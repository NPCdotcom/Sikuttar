---
title: Wave2 operations — index
kind: operations
slice: wave2
related_issue: "https://github.com/NPCdotcom/Sikuttar/issues/11"
created: "2026-10-17"
updated: "2026-10-22"
---

# Wave2 運用（インフラ）

Issue [#11](https://github.com/NPCdotcom/Sikuttar/issues/11) · 方針の正本: [ADR 0001](../../adr/0001-cloudflare-semantic-search-cost.md)

| 文書 | 用途 |
|------|------|
| [deploy-boundary.md](./deploy-boundary.md) | CF デプロイ Go / No-Go チェックリスト |
| [oauth-github-setup.md](./oauth-github-setup.md) | GitHub OAuth App · env 契約 · 本番 secrets |
| [free-path-decision.md](./free-path-decision.md) | **無料優先合意**（Vectorize / 生成 LLM / Paid は閉じる） |
| [question-quality-roadmap.md](./question-quality-roadmap.md) | **質問精度ロードマップ** A→B→C（計測 → Vectorize → 生成）· agreed |
| [question-quality-eval.md](./question-quality-eval.md) | 段 A の評価セット採点（before/after） |
| [vectorize-paid-gate.md](./vectorize-paid-gate.md) | Workers Paid / Vectorize 本番オン直前ゲート（当面スコープ外） |
| [gen-llm-gate.md](./gen-llm-gate.md) | 生成 LLM 載せる直前ゲート（ADR 0002 維持） |
| [prod-smoke.md](./prod-smoke.md) | 本番スモーク手順（共同者向け） |

**いま（2026-10-22）**: 本番 · `SEMANTIC_SEARCH=vectorize`（`sikuttar-stories` · 閾値 0.45 · 失敗時 Jaccard）· 質問テンプレ。段 **A+B 完了**。**C（生成）は閉じたまま**。
