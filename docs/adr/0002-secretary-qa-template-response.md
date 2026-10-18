---
title: ADR 0002 — 秘書照会 v1 はテンプレ応答（生成 LLM なし）
status: accepted
date: "2026-10-18"
accepted_at: "2026-10-18"
related: docs/design/elements/secretary-inquiry.md
related_prior: docs/adr/0001-cloudflare-semantic-search-cost.md
related_deliberation: docs/design/product/capability-secretary-qa-deliberation.md
---

# ADR 0002 — 秘書照会 v1 はテンプレ応答（生成 LLM なし）

## Context

秘書 capability（E12）は講義寄りの「生成付き Q&A」も視野にあるが、合意条件は **課金を膨らませない** こと。[ADR 0001](0001-cloudflare-semantic-search-cost.md) は意味検索の再要約に生成 LLM を必須としない。秘書面でチャット生成を初手必須にすると Neuron 消費とフラグ複雑性が増える。

ユーザー決定（2026-10-18）: 文書化波の前提として、v1 応答は **テンプレ組み立てのみ**。

## Decision

1. **v1 の `answer`**: 固定テンプレート＋スロット（属性帯 · 原因 · 解決例 · ブックマーク · タグ）をコード／設定で埋める
2. **Workers AI チャット／テキスト生成は呼ばない**（埋め込み検索は E9 の既存経路のまま。秘書経路では生成に使わない）
3. 根拠 0 または不足 → テンプレ助言を出さず「確認できない」系（LLM の有無に依存しない）
4. 後段で短い 1 パス生成を入れる場合は **別 ADR または明示 Go**。`SECRETARY_QA` だけでは生成オンにしない

## Consequences

- ローカル方針 B の受け入れが課金ゼロで完結しやすい
- 文面の自然さはテンプレ品質に依存（運用で文面調整）
- 「生成付き」デモは後段ゲートまで保留（AI Search / R2 再評価と同列の課金判断）

## Relations

- 要素: [secretary-inquiry.md](../design/elements/secretary-inquiry.md)
- 要件: FR25 · NFR9–NFR10（[要件-secretary.md](../requirements/failure-share/要件-secretary.md)）
- 先行: ADR 0001（検索コスト · 生成必須化しない）
