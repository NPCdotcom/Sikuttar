---
title: Wave2 — Workers Paid / Vectorize ゲート
kind: operations
slice: wave2
related_adr: docs/adr/0001-cloudflare-semantic-search-cost.md
created: "2026-10-17"
updated: "2026-10-17"
---

# Workers Paid / Vectorize ゲート

親決定: [ADR 0001](../../adr/0001-cloudflare-semantic-search-cost.md) · 要素: [semantic-search](../../design/elements/semantic-search.md)

## 原則

- **意味検索を本番経路で公開オンにする直前**まで、Workers Paid 契約と Vectorize インデックス作成は保留する
- それまでは `SEMANTIC_SEARCH=fallback`（D1 Jaccard 等）で開発・デモする

## ゲート前（いま · やらないこと）

- [ ] Workers Paid に加入しない（不要な課金を避ける）
- [ ] Vectorize インデックスを本番用に作らない
- [ ] `wrangler.toml` の Vectorize / AI バインディングを実 ID で有効化しない（コメントプレースホルダのまま）

## ゲート通過条件（本番オン直前）

すべて満たしてから進む:

- [ ] wave2 公開デモ一式がローカル（または CF + fallback）で動いている
- [ ] [deploy-boundary.md](./deploy-boundary.md) の初回公開 Go を満たしている、または同時実施する
- [ ] アカウントの Vectorize / Workers AI 料金表を確認し、Paid 要否をメモした
- [ ] 埋め込みモデル次元とインデックス設定を #2 実装と合意した

## ゲート後の作業（後工程 · 本 Issue の「後回し」）

1. Workers Paid 要否を確定し、必要なら契約
2. Vectorize インデックス作成
3. `wrangler.toml` のバインディングを実値に更新
4. `SEMANTIC_SEARCH=vectorize` に切替（フィーチャフラグ）
5. 投稿永続化後の upsert パイプラインを検証

## 参考

- [Vectorize pricing](https://developers.cloudflare.com/vectorize/platform/pricing/)
- [Workers AI](https://developers.cloudflare.com/workers-ai/)
