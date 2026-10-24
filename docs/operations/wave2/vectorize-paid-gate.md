---
title: Wave2 — Workers Paid / Vectorize ゲート
kind: operations
slice: wave2
related_adr: docs/adr/0001-cloudflare-semantic-search-cost.md
created: "2026-10-17"
updated: "2026-10-22"
---

# Workers Paid / Vectorize ゲート

親決定: [ADR 0001](../../adr/0001-cloudflare-semantic-search-cost.md) · 要素: [semantic-search](../../design/elements/semantic-search.md) · 無料優先: [free-path-decision.md](./free-path-decision.md)

## 原則

- 意味検索の本番オンは明示のユーザー Go のあとで行う
- Jaccard（`SEMANTIC_SEARCH=fallback`）は障害時フォールバックとして残す
- 生成 LLM（チャット）は別ゲート（[gen-llm-gate.md](./gen-llm-gate.md)）— **今回は開かない**

## 現状（2026-10-22 · B Go）

- **ユーザー Go**: 質問精度ロードマップ段 B（Vectorize）を本番オン
- モデル: `@cf/baai/bge-m3` · インデックス: `sikuttar-stories` · metric: cosine
- 寸法: 作成時に実埋め込み長で確定（想定 1024）
- 生成 LLM / ADR 0002 撤回: **しない**（C 非同時）
- Paid: 現行アカウントで `wrangler vectorize create` を試す。必須エラー時のみ Dashboard で Paid 有効化

## ゲート通過条件（本番オン直前）

すべて満たしてから進む:

- [x] wave2 公開デモ一式が CF + fallback で動いている
- [x] [deploy-boundary.md](./deploy-boundary.md) の初回公開 Go を満たしている
- [x] Vectorize / Workers AI 料金表を確認（小規模なら Free 枠内の見込み · Paid は create 失敗時）
- [x] 埋め込みモデル次元とインデックス設定を合意（bge-m3 · cosine · 実長で create）
- [x] **2026-10-22 ユーザー Go（段 B）**

## ゲート後の作業

1. Vectorize インデックス作成
2. `wrangler.toml` の `[ai]` / `[[vectorize]]` を有効化
3. `SEMANTIC_SEARCH=vectorize` に切替
4. 既存投稿の埋め込みバックフィル
5. deploy · paraphrase スモーク · 評価記録

## 参考

- [Vectorize pricing](https://developers.cloudflare.com/vectorize/platform/pricing/)
- [Workers AI](https://developers.cloudflare.com/workers-ai/)
