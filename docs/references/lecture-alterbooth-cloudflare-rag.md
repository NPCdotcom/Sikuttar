---
title: 参考 — 講義「チーム開発 × Cloudflare RAG」（オルターブース）
kind: reference
status: reference
phase: P3
created: "2026-10-18"
updated: "2026-10-18"
source_local: "C:/Users/npcdo/Downloads/チーム開発_Cloudflare_RAG.pdf"
source_note: "実践チーム開発講座資料 · Alterbooth Inc. · 約102ページ。著作物のため全文転載しない。"
related:
  - docs/adr/0001-cloudflare-semantic-search-cost.md
  - docs/design/elements/semantic-search.md
  - docs/design/elements/related-failure.md
  - docs/operations/wave2/README.md
---

# 参考 — 講義「チーム開発 × Cloudflare RAG」

**本ドキュメントは方針文書ではない。** 講義 PDF の要約と、Sikuttar 既存方針との切り分け表である。合意・採用の決定は別途（ユーザー Go）。ADR / 要件 / E9 を上書きしない。

## 出典

| 項目 | 値 |
|------|-----|
| ファイル | `チーム開発_Cloudflare_RAG.pdf`（ローカル Downloads） |
| 講座 | 実践チーム開発講座 |
| 提供 | 株式会社オルターブース（講師プロフィール記載あり） |
| 記録日 | 2026-10-18 |

## 講義構成（要約）

| ブロック | 内容（要約） |
|----------|----------------|
| 前半 | DX / DevEx / Platform Engineering / GitHub 開発全体像 / 生成 AI・プロンプト一般 |
| 中核（RAG） | RAG の定義・追加学習との差・効果と限界・データエンジニア役割 |
| CF 構成 | Workers + Workers AI + Vectorize + D1 + R2。独自 RAG と AI Search の選択 |
| 取込 | R2 原文 → チャンク → 埋め込み → Vectorize/D1。Queues / Workflows · 版公開 · 削除 |
| 回答品質 | 根拠表示 · 「資料から確認できない」 · 評価セット · AI Gateway · Basin 分析 |
| 後半 | GitHub×AI チーム開発 · Skills / MCP / サブエージェント · Cloudflare 公式プラグイン |

### 講義が示す回答パイプライン（中核）

```text
Web 質問
  → 回答 Worker（権限確認）
  → Workers AI（質問を埋め込み）
  → Vectorize（近傍 chunk_id）
  → D1（本文・出典・公開/権限）
  → Workers AI（質問＋本文から回答文を生成）
  → Web（回答・根拠）
```

### 講義が示す取込パイプライン（中核）

```text
R2（原文マニュアル）
  → 取込 Worker（本文抽出・チャンク分割）
  → Workers AI（埋め込み）
  → Vectorize（索引）+ D1（本文・ID・出典）
  （任意）Queues 再実行 · Workflows · 公開バージョン切替
```

### 管理範囲の選択（講義）

- **独自 RAG**: Worker に埋め込み・検索・生成を実装
- **AI Search**: 資料の分割・索引・検索を任せ、Worker は検索結果を取得して回答

---

## A. 既存方針と整合するもの

講義と **すでに重なっている**（Sikuttar が決めている／実装している方向）。

| 講義の論点 | Sikuttar 側 |
|------------|-------------|
| CF Workers + D1 + Workers AI + Vectorize を検索/RAG 候補にする | [ADR 0001](../adr/0001-cloudflare-semantic-search-cost.md) · NFR5 · [semantic-search.md](../design/elements/semantic-search.md) |
| 埋め込み → ベクトル近傍 → D1 から本文を取る | E9 配置 · wave2 `embedText` / `queryVectorIndex` / hydrate |
| 未設定時でも落とさない | FR12 · `SEMANTIC_SEARCH=fallback` · Jaccard |
| 本番オン直前まで Paid / Vectorize を急がない | [vectorize-paid-gate.md](../operations/wave2/vectorize-paid-gate.md) · ローカル受け入れ Pass（2026-10-18） |
| merge と本番公開は別 | [deploy-boundary.md](../operations/wave2/deploy-boundary.md) |
| 「似ている」だけで答えを決めない | ADR: 生成 LLM による再要約を必須としない · 類似提示中心（glossary の RAG 読み分け） |
| GitHub で変更共有・レビュー | 既存の GitHub / PR 運用 |

---

## B. 関連するが差分・拡張があるもの

同じ問題領域だが、**サービス形態や厚みが違う／まだ薄い**。

| 講義 | Sikuttar 現状 | 差分の性質 |
|------|---------------|------------|
| 回答 Worker が **Workers AI で文章を生成**し、根拠付きで返す | `GET /search` は **類似失敗談の一覧**（カード表示）。生成 RAG ではない | **サービス形態**: Q&A 生成 vs 類似提示 |
| R2 に原文レイク · チャンク分割 · Queues/Workflows 取込 | 投稿を D1 に直接 persist · 投稿後 `upsertStoryEmbedding`（未バインド時 no-op） | **取込パイプライン**が講義より薄い |
| D1 に出典・バージョン・公開条件・削除状態 | accounts / bookmarks / tags はある。ドキュメント版・権限モデルは講義ほど厚くない | **データ契約**の差 |
| 独自 RAG vs **AI Search** | 独自 factors + fallback。AI Search は未検討 | **未採用オプション** |
| 評価用質問セット · AI Gateway · Basin SQL | 運用は Paid/Vectorize ゲート中心。検索品質の系統的 eval / 分析基盤は未整備 | **観測・評価**が薄い |
| 製品マニュアル Q&A を想定した例 | 失敗談共有×集合知の学習向け Web（charter） | **プロダクト前提**の差（手段は共有しうる） |

---

## C. 未言及・別系統（現行方針にほぼ無い）

講義にはあるが、**製品方針ドキュメントとしてはまだ載っていない／別レイヤ**のもの。

- DX・DevEx・Platform Engineering 一般論、Azure / GitHub EMU など企業向け前半
- Claude Code / Codex / Skills / MCP / サブエージェント / ハーネスの講義固有ツール箱（エージェントキット側には別系統の手順があるが、**講義＝製品スタック方針ではない**）
- R2 raw/clean/curated レイク設計、Iceberg / Basin Catalog 分析基盤
- 「資料に答えがないとき問い合わせ先を案内する」マニュアルサポート UX
- Cloudflare 公式プラグイン marketplace のセットアップ手順（開発者ツール設定）

---

## 次に議論しうる論点

製品側の審議は [capability-secretary-qa-deliberation.md](../design/product/capability-secretary-qa-deliberation.md)（**deliberating** · 秘書として追加、本線は類似検索維持）へ移した。

講義固有で秘書メモに未転記の残り:

1. 取込を **R2 + チャンク + Queues** まで広げるタイミング
2. **AI Search** を独自 Vectorize と比較再評価するゲート
3. 検索品質の **評価セット** · **AI Gateway** / Basin 等の観測

---

## 参照（リポジトリ内）

- [ADR 0001](../adr/0001-cloudflare-semantic-search-cost.md)
- [E9 意味検索](../design/elements/semantic-search.md)
- [E6 関連失敗（RAG · 後段）](../design/elements/related-failure.md)
- [glossary RAG / 意味検索](../glossary/alignment-p1-failure-share.md)
- [wave2 運用](../operations/wave2/README.md)
