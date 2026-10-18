---
title: Wave2 — 生成 LLM ゲート
kind: operations
slice: wave2
related_adr: docs/adr/0002-secretary-qa-template-only.md
created: "2026-10-18"
updated: "2026-10-18"
---

# 生成 LLM ゲート

親決定: [ADR 0002](../../adr/0002-secretary-qa-template-only.md) · 質問 UI: E12 テンプレのみ

## 原則

- **Free 初回公開では生成 LLM を入れない**（Workers AI チャット生成・講義向け生成パスは次ゲート）
- 本番の質問（`SECRETARY_QA=on`）は **テンプレート応答のみ**（ADR 0002 維持）

## ゲート前（いま · やらないこと）

- [x] Workers AI を生成チャット用途で有効化しない
- [x] ADR 0002 を撤回しない
- [x] `wrangler.toml` の `[ai]` を生成パス用にオンしない（Paid/Vectorize ゲートと分離）

## ゲート通過条件（生成を載せる直前）

すべて満たしてから進む:

- [ ] Free 公開デモが安定している
- [ ] 生成モデル・料金・プロンプト方針を合意した
- [ ] ADR 0002 の後継 ADR（または明示改訂）がある
- [ ] テンプレ経路を残すか切替えるかを決めた

## 参考

- [Workers AI](https://developers.cloudflare.com/workers-ai/)
- [vectorize-paid-gate.md](./vectorize-paid-gate.md)（埋め込み検索は別ゲート）
