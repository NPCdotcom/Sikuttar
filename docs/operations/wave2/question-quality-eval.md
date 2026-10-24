---
title: Wave2 — 質問精度評価（段 A）
kind: operations
slice: wave2
status: recorded
created: "2026-10-22"
updated: "2026-10-22"
related:
  - docs/operations/wave2/question-quality-roadmap.md
  - docs/operations/wave2/question-quality-eval-set.json
  - docs/operations/wave2/vectorize-paid-gate.md
---

# 質問精度評価（段 A → B）

評価セット: [question-quality-eval-set.json](./question-quality-eval-set.json)  
ミニコーパス: `tests/fixtures/eval-mini-corpus.ts`（D1 非依存）  
ランナー: `tests/questionQualityEval.test.ts`

## 変更内容（A）

| 項目 | 内容 |
|------|------|
| Floor | クエリ側を `tokenizeQueryForFloor`（表層・bigram なし）+ `passesQueryFloor` |
| ランキング | 従来どおり `tokenizeForSimilarity` + `scoreTokenMatch`（0.7/0.3） |
| UX | 質問画面に核語ヒント。根拠 0 時に再試行ヒント（文字数制限なし） |
| 重み | 変更なし（セット再採点で floor 修正のみで long/short/empty が期待どおり） |

## Before / After（ミニコーパス）

`expect` 一致 = そのクエリの期待（hits/empty）どおりか。

| bucket | n | before（legacy bigram floor） | after（surface floor） | メモ |
|--------|---|-------------------------------|------------------------|------|
| short | 3 | expect 一致 | expect 一致 | 短語は維持 |
| medium | 3 | expect 一致 | expect 一致 | |
| long | 3 | キーワードが揃う文は hit しうる | expect 一致 + **\|Q\| 縮小** | 主指標は \|Q\| と単体の膨張ケース |
| paraphrase | 2 | 不安定（言い換え） | 不安定（言い換え） | **Free の頭打ち → B 材料** |
| expect_empty | 3 | expect 一致 | expect 一致 | 無関係クエリは空のまま |

### 長文 \|Q\|（after の計測）

| id | full \|Q\|（bigram） | floor \|Q\|（表層） |
|----|---------------------|-------------------|
| long-deploy-learn | ≫ floor | ≪ full（テストで `floor.size < full.size` を固定） |
| long-oauth-fail | 同上 | 同上 |
| long-test-skip | 同上 | 同上 |

### 単体で示した before 失敗パターン

`passesTokenMatchFloor` に filler で膨らませたクエリ集合を渡すと coverage &lt; 0.2 で落ちる一方、同じ候補に対し表層 floor（デプロイ/確認/本番）は通過（`tests/scoreStorySimilarity.test.ts`）。

## A 出口メモ

- 短語・中文・（核語のある）長文・無関係空振りは、固定セットで第三者に説明可能。
- **言い換え（paraphrase）は Free Jaccard では頭打ち** → ロードマップ **B（Vectorize）** の検討材料。
- 重み 0.7/0.3 の再調整は今回不要（floor 修正でセット期待を満たした）。

段 A の作業域としては完了。

---

## 段 B（Vectorize · 2026-10-22）

| 項目 | 内容 |
|------|------|
| フラグ | `SEMANTIC_SEARCH=vectorize` |
| インデックス | `sikuttar-stories` · 1024 次元 · cosine · `@cf/baai/bge-m3` |
| バックフィル | `scripts/backfill-embeddings.mjs` · 100 件 upsert 済 |
| 弱ヒット除去 | `MIN_VECTOR_SCORE = 0.45`（無関係 topK を落とす） |
| フォールバック | 強ヒット 0 件または AI/VZ 失敗時 → Jaccard |
| 生成 LLM | **オフ**（C 非同時 · ADR 0002） |

### 本番スモーク（`/assistant/ask`）

| クエリ（評価セット相当） | bucket | evidence | 所見 |
|--------------------------|--------|----------|------|
| デプロイ | short | 5 | タグ「デプロイ」中心 |
| デプロイ前の確認を飛ばしてしまったときの学びは？ | long | 5 | デプロイ関連 |
| 本番公開の直前チェックを怠った話 | paraphrase | 5 | **言い換えでも hit**（A の頭打ちを超えた） |
| 認証連携の戻り先設定ミス | paraphrase | 5 | hit（近傍はインシデント系寄り） |
| カレーの作り方 | expect_empty | 0 | 閾値で空（閾値なしだと ~0.39 で誤 hit） |
| 明日の天気は？ | expect_empty | 0 | 同上 |

### B 出口メモ

- paraphrase が本番で根拠付きになった → **段 B の出口を満たす**
- 回答文は引き続きテンプレ（ADR 0002）。文面の自然さが足りない場合のみ **C** を検討
- C は今回開いていない
