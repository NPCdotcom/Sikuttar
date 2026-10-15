---
title: H1 要素 — 失敗談（投稿）
kind: design
phase: P3
scope_level: H1
status: agreed
agreed_at: "2026-10-15"
slice: S1
element_id: E1
related_product: docs/design/product/charter.md
related_h1: docs/design/elements/failure-share-h1.md
related_requirements: docs/requirements/failure-share/要件.md
created: "2026-10-15"
updated: "2026-10-15"
---

# Element — 失敗談（投稿）· E1

親: [failure-share-h1](failure-share-h1.md) · charter §8「失敗談（投稿）」  
要件: FR1 · FR3（本文投稿・永続化 · 状況／原因任意）

## 目的

愚痴感覚で書ける失敗談を、1 件の投稿単位として受け取り・保持する。原因の完成度を求めない。

## Recognition

| 認識単位 | 一文 |
|----------|------|
| 失敗談 | 状況・結果（原因は任意）を含む、学びの種としての投稿単位 |

≠ コード上の `class FailureStory` 必須。認識名として固定する。

## Factors

| 因子 | 種別 | メモ |
|------|------|------|
| 投稿する | action | ブラウザから本文を送る |
| 永続化する | function | 再読込後も存在する（FR1） |
| 本文 | property | **必須** · 短文〜中文 |
| 状況 | property | **任意** · 空でよい（FR3） |
| 原因 | property | **任意** · 空でよい（FR3） |
| 作成時刻 | property | フィード並びの既定キー候補 |
| 内部著者キー | property | 表示しない（E8）。E7 と紐づけうる |

## 境界・非目的

- **含む**: 1 投稿の生成・保持・読み出し単位
- **含まない**: リアクション集計（E3）· BAD（E4）· 類似提示（E6）· 公開身元ラベル
- **拡張点（後段）**: リアクション／優先度／RAG が参照する ID を持つこと

## メッセージ／拡張（§7）

| メッセージ | 意味 |
|------------|------|
| `FailureStorySubmitted` | 投稿受付（本文必須検証通過） |
| `FailureStoryPersisted` | 永続化完了 |

並び替え・類似照会は別因子／別認識が購読する。失敗談側に埋め込みクラスで肥大化させない。

## エージェント提案

| 案 | 概要 | 向く状況 |
|----|------|----------|
| A（推奨） | フィールドは `body` 必須 + `situation?` + `cause?` + `createdAt` + `authorKey?` | MVP・FR1/FR3 直結 |
| B | 原因を構造化（タグ必須など） | 学び精度は上がるが愚痴ハードルが上がる → 非推奨 |
| C | 本文のみ・状況／原因カラムを後付け | 最短だがスキーマ拡張コスト |

**推奨: A** · **決定: A**（S1 agreed 2026-10-15）

## ユーザー思考

> S1 agreed

## Open questions

- [x] フィールド案 A でよいか → **yes**
- 文字数上限 → 実装時に仮上限で可（Open · 非ブロッカー）

## 次

- [x] 合意 → `status: agreed`
- [ ] H2 / P4: 投稿・永続化の system · program
