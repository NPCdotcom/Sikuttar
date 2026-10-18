---
title: H1 要素 — 秘書照会
kind: design
phase: P3
scope_level: H1
status: agreed
agreed_at: "2026-10-18"
slice: secretary
element_id: E12
related_product: docs/design/product/charter.md
related_h1: docs/design/elements/failure-share-h1.md
related_h0: docs/design/product/capability-secretary-qa-deliberation.md
related_requirements: docs/requirements/failure-share/要件-secretary.md
related_adr: docs/adr/0002-secretary-qa-template-response.md
created: "2026-10-18"
updated: "2026-10-18"
---

# Element — 秘書照会 · E12

親: [failure-share-h1](failure-share-h1.md) · [capability-secretary-qa-deliberation](../product/capability-secretary-qa-deliberation.md)  
要件: FR20–FR25 · ADR: [0002](../../adr/0002-secretary-qa-template-response.md)

## 目的

蓄積失敗談に基づき、短い助言と根拠リンクを返す **秘書照会** 面を置く。E9（意味検索一覧）は維持し、本認識は助言＋根拠構成の別チャネルとする。v1 応答は固定テンプレ組み立て（生成 LLM なし）。

## Recognition

| 認識単位 | 一文 |
|----------|------|
| 秘書照会 | 蓄積失敗談に基づき短い助言と根拠を返す照会 |

## Factors

| 因子 | 種別 | メモ |
|------|------|------|
| フォーカス候補を取得する | function | 既存 `searchStories` 再利用 · 上限 20 · Jaccard score>0 / Vectorize topK |
| occupation 比率を集計する | function | フォーカス集合の 1/3 以上で属性節。キーは occupation のみ（v1） |
| テンプレ応答を組み立てる | function | 固定文＋スロット。Workers AI チャット生成は使わない（ADR 0002） |
| 根拠をリンクする | action | コーパス ·（本人のみ）ブックマーク · タグを役割分け · 本文に最大 3–5 |
| フラグでゲートする | property | `SECRETARY_QA=off\|on`（既定 off） |

## 境界・非目的

- **含む**: `POST /assistant/ask` · 専用タブ／投稿起点入力 · 属性節の条件付き省略 · 根拠不足時は答えない
- **含まない**: 生成 LLM · AI Search / R2 · 公開 JSON への属性露出 · E9 一覧の置換 · 起点投稿の強制インクルード · 公開プロフィール
- **再利用**: E9 の検索経路（ローカル Jaccard · CF は Vectorize ゲート後）

## API（境界）

| 項目 | 値 |
|------|------|
| メソッド | `POST /assistant/ask` |
| body | `{ "question": string, "seed_story_id"?: string }` |
| 成功形 | `{ answer, evidence[], attribute_hint? }` |
| フラグ | `SECRETARY_QA=off\|on`（off 時は機能無効） |

`seed_story_id` は任意。フォーカス集合へ当該投稿を必ず含めない。

## メッセージ／拡張

| メッセージ | 意味 |
|------------|------|
| `SecretaryAnswered` | テンプレ応答と根拠の返却 |
| `SecretaryInsufficientEvidence` | 根拠不足のため回答しない／確認できない |

## 決定（H0 合意転記 · 2026-10-18）

| 項目 | 決定 |
|------|------|
| 候補上限 | 20 |
| Jaccard | score > 0 の上位 20 |
| Vectorize | topK=20 のみ |
| 根拠リンク | 最大 3–5 |
| 属性 | occupation · 1/3 未満は節省略 |
| 応答 | テンプレのみ（LLM なし · ADR 0002） |
| 受け入れ | ローカル方針 B · CF/Paid は別ゲート |

## 次

- [x] agreed（文書）
- [x] `SECRETARY_QA` プロトタイプ実装（2026-10-18 · テンプレ · フラグ既定 off）
