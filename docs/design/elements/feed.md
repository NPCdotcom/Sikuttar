---
title: H1 要素 — フィード／タイムライン
kind: design
phase: P3
scope_level: H1
status: agreed
agreed_at: "2026-10-15"
slice: S1
element_id: E2
related_product: docs/design/product/charter.md
related_h1: docs/design/elements/failure-share-h1.md
related_requirements: docs/requirements/failure-share/要件.md
created: "2026-10-15"
updated: "2026-10-15"
---

# Element — フィード／タイムライン · E2

親: [failure-share-h1](failure-share-h1.md) · charter §8「フィード／タイムライン」  
要件: FR2 · NFR2（一覧閲覧 · 投稿→閲覧の一続き）

## 目的

永続化された失敗談を、ブラウザ上で一覧として読める面を提供する。

## Recognition

| 認識単位 | 一文 |
|----------|------|
| フィード／タイムライン | 失敗談の一覧表示面（並びは差し替え可能） |

製品語彙は「フィード／タイムライン」。一般名への言い換えで charter から切り離さない。

## Factors

| 因子 | 種別 | メモ |
|------|------|------|
| 一覧する | action | 複数の失敗談を表示（FR2） |
| 並び替える | function | MVP は既定順のみで可 |
| 既定順（新着） | property | `createdAt` 降順を仮既定 |
| 表示項目セット | property | 本文 ·（任意）状況/原因 · 時刻。**身元ラベルなし**（E8） |
| 優先度フック | function | E5 差し込み点（S4）。MVP は未接続でよい |

## 境界・非目的

- **含む**: 一覧の読み出しと表示順序の適用点
- **含まない**: 投稿フォーム本体（E1 の action）· 批判コメントスレ · BAD 公開ランキング
- **後段**: E5 表示優先度が「並び替える」の実装を差し替える

## メッセージ／拡張（§7）

| メッセージ（購読） | 意味 |
|--------------------|------|
| `FailureStoryPersisted` | 一覧に新しい失敗談が現れうる |
| （後段）`DisplayPriorityRecalculated` | 並び替え因子の差し替え |

一覧 UI は「並び替え関数」を差し込める境界を残す（NFR3）。

## エージェント提案

| 案 | 概要 | 向く状況 |
|----|------|----------|
| A（推奨） | MVP は新着降順の単一フィード。ページングは簡易（全件 or limit） | 発表デモ最短 |
| B | 最初から優先度スコアでソート | E5 未確定のため時期尚早 |
| C | 複数タブ（新着／おすすめ） | 範囲超過 |

**推奨: A** · **決定: A**（S1 agreed 2026-10-15）

## ユーザー思考

> S1 agreed

## Open questions

- [x] 既定順 = 新着降順でよいか → **yes**
- ページング粒度 → 実装時（非ブロッカー）

## 次

- [x] 合意 → `status: agreed`
- [ ] H2 / P4: 一覧読み出し system · program
