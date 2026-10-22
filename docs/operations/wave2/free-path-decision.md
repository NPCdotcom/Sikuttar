---
title: Wave2 — 無料優先パス合意（ゲート4）
kind: operations
slice: wave2
status: agreed
created: "2026-10-18"
updated: "2026-10-22"
related:
  - docs/adr/0001-cloudflare-semantic-search-cost.md
  - docs/adr/0002-secretary-qa-template-only.md
  - docs/operations/wave2/vectorize-paid-gate.md
  - docs/operations/wave2/gen-llm-gate.md
  - docs/operations/wave2/question-quality-roadmap.md
---

# 無料優先パス合意（ゲート4）

## 合意（2026-10-18 · ユーザー）

| 項目 | 決定 |
|------|------|
| 方針 | **A** — 課金ゲートは閉じたまま。無料で伸ばせる改善だけ進める |
| Vectorize | **スコープ外**（CF 側で課金になりやすいため、当面つくらない・オンしない） |
| 生成 LLM | **スコープ外**（ADR 0002 維持 · テンプレ質問のみ） |
| Workers Paid | **加入しない**（Vectorize 本番オンとセットのゲートのまま） |
| 共同者スモーク / 発表デモ台本 / シード推敲 | スコープ外（本合意の対象外） |

## 上書き（2026-10-22 · 段 B Go）

| 項目 | 決定 |
|------|------|
| Vectorize | **オン**（`SEMANTIC_SEARCH=vectorize` · 埋め込み＋近傍）。Jaccard は障害時フォールバック |
| 生成 LLM | **閉じたまま**（ADR 0002 · 段 C は別 Go） |
| 投稿基盤 | Workers + D1 のまま。チャット生成は載せない |

## いまの本番経路（B 後）

- Workers + D1 · `SEMANTIC_SEARCH=vectorize`（失敗時 Jaccard）
- `SECRETARY_QA=on` · **テンプレ組み立てのみ**（Workers AI チャット生成なし）
- `[ai]` + Vectorize `sikuttar-stories` バインディング有効

## 講義資料との対応（参考 · 路線変更にしない）

外部講義「チーム開発 / Cloudflare RAG」（Alterbooth）からの切り出し:

| 講義の主張 | Sikuttar での読み替え |
|------------|------------------------|
| RAG は LLM を内包せず、**LLM なしでも利用可能**（Retriever だけでも成立） | 検索 = D1 Jaccard · 質問 = テンプレ根拠提示。生成ステップを載せない |
| CF 例構成は R2 · D1 · **Vectorize** · Workers AI | D1（本文）は採用済み。**Vectorize / 埋め込み生成は課金リスクのため採用しない** |
| AI Search に取り込み・検索を任せる案 | マネージド寄り・課金増の方向 → **採用しない**（無料優先） |

講義の「フル CF RAG」図をそのまま目標にしない。取るのは **Retrieval を残し Generator を載せない** という無料寄りの切り分けだけ。

## この合意のあとでやってよいこと（無料）

- Jaccard / coverage / トークン化など **D1 上の検索品質**改善
- テンプレ秘書の根拠選定・文言の改善（生成 LLM なし）
- 運用文書・フラグ境界の明確化
- 質問精度ロードマップの **段 A**（[question-quality-roadmap.md](./question-quality-roadmap.md)）

## やってはいけないこと（当面）

- Workers AI **チャット生成**の本番オン（埋め込みは B で許可）
- AutoRAG / AI Search マネージドへの寄せ
- 根拠 0 のまま生成で埋める

段 C（生成）の再開は [gen-llm-gate.md](./gen-llm-gate.md) + 明示 Go のみ。
