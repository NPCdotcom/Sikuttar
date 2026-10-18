---
title: 要件定義 — failure-share 秘書照会
kind: requirement-spec
phase: P2
status: agreed
agreed_at: "2026-10-18"
scope_level: H1
related_要求: 要求-secretary.md
related_prior: docs/requirements/failure-share/要件-wave2.md
related_deliberation: docs/design/product/capability-secretary-qa-deliberation.md
related_element: docs/design/elements/secretary-inquiry.md
related_adr: docs/adr/0002-secretary-qa-template-response.md
design_constraint: "E9 維持 · FR13 維持 · v1 応答はテンプレのみ · 課金経路は SECRETARY_QA で隔離"
created: "2026-10-18"
updated: "2026-10-18"
---

# 要件定義 — 秘書照会

親要求: [要求-secretary.md](./要求-secretary.md)（agreed · 2026-10-18）  
既存: [要件-wave2.md](./要件-wave2.md)（FR11–FR19）は維持。本波は **FR20–** を追加。  
要素: [secretary-inquiry.md](../../design/elements/secretary-inquiry.md) · ADR: [0002](../../adr/0002-secretary-qa-template-response.md)

## スコープ

### In scope

- 秘書照会 API · UI 入り口（専用タブ · 投稿起点）
- フォーカス候補（既存意味検索経路 · 上限 20）
- occupation 集計（1/3）と属性節の条件付き省略
- 根拠リンク（コーパス · 本人ブックマーク · タグ）· 最大 3–5
- テンプレ応答（生成 LLM なし）
- `SECRETARY_QA` フラグ

### Out of scope

- Workers AI チャット生成（v1）
- AI Search / R2
- 公開プロフィール · `GET /me/stories`（別トラック）
- CF デプロイ / Vectorize Paid 必須化

## 機能要件

| ID | 要件 | 対応要求 | 優先 | 検証方法 |
|----|------|----------|------|----------|
| FR20 | 利用者は自由質問（専用タブ）または投稿起点で秘書に問い合わせできる | R18 | should | UI: タブあり · 詳細から入力へ載せる導線あり |
| FR21 | `POST /assistant/ask` が `{ question, seed_story_id? }` を受け、`{ answer, evidence[], attribute_hint? }` を返す（フラグ on 時） | R18 | should | API: スキーマどおり · seed は任意で強制インクルードしない |
| FR22 | フォーカス候補は話題関連の最大 20。Jaccard は score>0、Vectorize は topK のみ。根拠リンクは最大 3–5 | R19 | should | 単体/手動: 件数上限 · 無根拠で空答えにならない／根拠0は拒否 |
| FR23 | 根拠が無い／不足のとき、助言本文を捏造せず「答えない／確認できない」系を返す | R19 | should | 手動: 無関係クエリで生成っぽい長文が出ない |
| FR24 | フォーカス集合の occupation が 1/3 以上のときのみ属性節（attribute_hint）。未満は属性節省略。公開フィード／詳細／検索 JSON に属性を出さない | R20 | should | 集計ユニット · 公開 JSON に occupation なし（FR13） |
| FR25 | `SECRETARY_QA=off`（既定）では秘書 API／UI が無効。on でも応答は**固定テンプレ組み立て**で、Workers AI チャット生成を呼ばない | R21 | should | off→拒否/非表示 · on→テンプレ · AI.run チャット無し |

## 非機能要件

| ID | 要件 | 対応要求 | 優先 | 検証方法 |
|----|------|----------|------|----------|
| NFR9 | 秘書の根拠集めは既存 `searchStories`／類似因子を再利用し、別索引を初手必須にしない | R21 | should | 設計レビュー: factor 境界 |
| NFR10 | プロトタイプ受け入れは**ローカル方針 B**（Jaccard · フラグ on · テンプレ）。CF デプロイ / Paid は別ゲート | R21 | should | 受け入れチェックリスト（実装波） |
| NFR11 | AI Search / R2 は CF 初回公開 + Paid 明示 Go のあと再評価 | R21 | could | 文書: 再評価条件が H0/ADR と一致 |

## 受け入れ（P2→P3 · 文書）

1. FR20–FR25 · NFR9–NFR11 が Open ブロッカーになっていない
2. 匿名（FR4）· FR13 · E9 維持と矛盾する要件が無い
3. E12 が設計ドキュメントに落ちている（[secretary-inquiry](../../design/elements/secretary-inquiry.md)）
4. ADR 0002（テンプレのみ）が accepted

## 実装波メモ（未 Go）

- コード・FE は別波。本ファイルは検証方法の定義まで。
