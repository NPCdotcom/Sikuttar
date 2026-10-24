---
title: Wave2 — 質問精度ロードマップ（A→B→C）
kind: operations
slice: wave2
status: agreed
agreed_at: "2026-10-22"
created: "2026-10-22"
updated: "2026-10-22"
related:
  - docs/operations/wave2/free-path-decision.md
  - docs/operations/wave2/vectorize-paid-gate.md
  - docs/operations/wave2/gen-llm-gate.md
  - docs/design/elements/secretary-inquiry.md
  - docs/adr/0002-secretary-qa-template-response.md
source: "メンターレビュー（清島・下道 · 2026-10-18 前後）への応答方針"
---

# 質問精度ロードマップ（A → B → C）

メンター指摘（質問の関連精度 · 長文で根拠が空 · 費用とクオリティ）に対し、次の **3 段を順番に進める**。飛び級しない（前段の「測れた／限界が見えた」が次ゲートの開錠条件）。

| 段 | 名前 | 課金 | いまの状態 |
|----|------|------|------------|
| **A** | 無料 Retriever の計測と改善 | なし | **現行の作業域**（Free 合意と両立） |
| **B** | ベクトル検索（＋任意でリランク） | Workers Paid / Vectorize 想定 | ゲート閉じ（[vectorize-paid-gate.md](./vectorize-paid-gate.md)） |
| **C** | 生成 LLM（回答文の生成） | Workers AI 等 | ゲート閉じ（[gen-llm-gate.md](./gen-llm-gate.md) · ADR 0002） |

順序の理由: **測る → 意味検索で言い換えを解く → それでも文面が足りないときだけ生成**。講義の「RAG = Retriever が先、Generator は任意」と同じ向き。

---

## A — 無料経路の計測と改善（いま）

**目的**: 「重みを触ったが良くなったかわからない」「長文質問で結果が出ない」を、第三者にも説明できる形にする。

| やること | ねらい | 状態（2026-10-22） |
|----------|--------|-------------------|
| 固定の評価クエリセット（短語 / 中文 / 長文 · 成功期待と空振り期待） | 前後比較を主観から外す | 済 · [question-quality-eval-set.json](./question-quality-eval-set.json) |
| 長文で `score>0` が消えやすい件の切り分け（coverage floor · トークン化 · UX ヒント） | 下道指摘への直接応答 | 済 · `tokenizeQueryForFloor` + `passesQueryFloor` · Assistant ヒント |
| Jaccard / coverage / タグ重みの調整は **セット再採点とセット** | 「調節した」だけを避ける | 済 · 重みは据え置き（floor のみでセット達成） |
| テンプレ根拠スロット（原因優先など）の改善 | 生成なしで応答の関連感を上げる | 変更なし（hit 後の噛み合いは現状テンプレで十分） |

**実施記録**: [question-quality-eval.md](./question-quality-eval.md)

**出口（B を検討してよい条件）**:

- [x] 評価セットで「短語は概ね当たるが、言い換えは頭打ち」が表で示せる
- [x] Free のまま伸ばせる手（トークン・floor・UX）を一通り試した記録がある

**やらない**: Vectorize 作成 · 生成 LLM オン · Paid 加入を前提にした作業

---

## B — ベクトル検索（言い換え・同義の壁）

**目的**: 清島指摘どおり、単語一致の限界（同じニュアンスの別語が拾えない）を意味ベクトルで超える。

| やること | ねらい | 状態（2026-10-22） |
|----------|--------|-------------------|
| Vectorize + 埋め込み（`SEMANTIC_SEARCH=vectorize`） | クエリと本文の意味近傍 | **完了**（本番オン · バックフィル済） |
| 候補を多めに取り、必要なら **リランク**（別スコアで絞る） | 清島の「多めに取ってから絞る」 | topK + `MIN_VECTOR_SCORE=0.45`（リランクモデルは未使用） |
| Jaccard はフォールバックとして残す | 障害・未インデックス時の逃げ | 維持 |

**入口**: [vectorize-paid-gate.md](./vectorize-paid-gate.md) の通過条件 + **A の出口** + 明示のユーザー Go（**2026-10-22 取得**）  
**実施記録**: [question-quality-eval.md](./question-quality-eval.md) 段 B  

**出口（C を検討してよい条件）**:

- [x] 同じ評価セットで A 比の改善が説明できる（paraphrase が本番 hit）
- [ ] それでも「根拠は近いが回答文が噛み合わない」が残る、またはデモ要件で自然文生成が必須、と判断できる → **未充足なら C 不要**

**やらない（B 単体では）**: チャット生成を本番質問の必須経路にする（それは C）· **C は同時 Go しない**
---

## C — 生成 LLM（回答の言い回し）

**目的**: Retriever が十分な根拠を返したうえで、テンプレでは足りない「質問への直接的な答え方」を生成で補う。

| やること | ねらい |
|----------|--------|
| 根拠付きの短い生成（Workers AI 等） | 費用対効果を根拠件数・トークン上限で縛る |
| ADR 0002 の更新または後継 ADR | テンプレ必須方針の明示変更 |
| 生成失敗時はテンプレ／「確認できない」へフォールバック | 品質と可用性の分離 |

**入口**: [gen-llm-gate.md](./gen-llm-gate.md) + **B の出口**（または「B なしで生成だけ」は原則採らない）+ 明示 Go  
**やらない**: 根拠 0 のまま生成で埋める · 講義フル構成（R2 / AI Search 等）への一気寄り

---

## メンター指摘との対応

| 指摘 | 主に効く段 |
|------|------------|
| 重み調節の良し悪しがわからない | **A**（評価セット） |
| 短語は出る・長文は出ない | **A**（floor / UX）。言い換え型の長文は **B** |
| 単語一致の精度上限 | **B** |
| 多め取得 + リランク | **B** |
| 費用とクオリティのジレンマ（生成 RAG） | **A で限界を示してから B、なお文面不足なら C** |

---

## いまの推奨フォーカス

1. **A・B とも出口条件を満たした**（[question-quality-eval.md](./question-quality-eval.md)）  
2. **C は閉じたまま**。文面生成が必要になったら明示 Go  
3. メンターへは「Retriever は Jaccard→Vectorize まで。生成は未搭載（費用対効果で保留）」と説明できる

**合意（2026-10-22）**: この並び（A→B→C）で進める。実施記録: [question-quality-eval.md](./question-quality-eval.md)。
