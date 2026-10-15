---
title: H2 システム — フィード閲覧（SYS2）
kind: design
phase: P3
scope_level: H2
status: agreed
agreed_at: "2026-10-15"
system_id: SYS2
slice: S1
related_h2: docs/design/systems/failure-share-h2.md
related_elements:
  - docs/design/elements/feed.md
  - docs/design/elements/anonymous-display.md
related_requirements: docs/requirements/failure-share/要件.md
created: "2026-10-15"
updated: "2026-10-15"
---

# System — フィード閲覧 · SYS2

親: [failure-share-h2](failure-share-h2.md)  
H1: [feed](../elements/feed.md)（E2 agreed）· [anonymous-display](../elements/anonymous-display.md)（E8 agreed）  
要件: FR2 · FR4 · NFR2

## 目的

Store 上の失敗談を新着順で読み出し、匿名化してブラウザ一覧に出す。投稿直後に一覧で確認できる一続きを成立させる。

## Recognition

| 認識単位 | 一文 |
|----------|------|
| フィード閲覧システム | E2 の一覧と E8 の匿名化を合成する境界 |

## Factors

| 因子 | 種別 | メモ |
|------|------|------|
| 一覧を読み出す | action / function | Store から取得 |
| 新着で並び替える | function | createdAt 降順（E2 決定） |
| 匿名化する | function | authorKey · 属性を表示項目から除去（E8） |
| 一覧を描画する | action | ブラウザ · 身元ラベルなし |
| （フック）優先度で並び替える | function | E5 · 未接続 · 差し替え点のみ |

## モジュール境界 · データフロー

```text
Store
  → listFailureStories({ order: createdAt desc, limit? })
  → map anonymizeForDisplay(record)   // strips authorKey, attributes, any identity
  → UI(フィード)
```

表示項目（論理）:

| 出す | 出さない |
|------|----------|
| body · situation? · cause? · createdAt | authorKey · 属性 · 氏名 · ログインID · 「（匿名）」ラベル |

`FailureStoryPersisted` を購読して再取得／楽観追加してもよい（実装選択 · P4）。

## 境界・非目的

- **含む**: 読み出し · 新着ソート · 匿名化 · 一覧 UI
- **含まない**: 投稿フォーム（SYS1）· リアクション UI · BAD 表示 · RAG パネル
- **後段**: `sortByDisplayPriority` を並び替え関数として差し替え（E5）

## エージェント提案

| 案 | 概要 | 推奨 |
|----|------|------|
| A | list → anonymize → render。ソート関数は port | **推奨** |
| B | Store クエリ結果を UI が生で表示（authorKey 含む） | FR4 違反リスク → 非推奨 |
| C | 最初から優先度スコア必須 | S4 前倒し → 非推奨 |

**推奨: A**

## ユーザー思考

> 

## Open questions

- [x] SYS2 パイプライン（list → anonymize → render）でよいか → **yes**
- リアルタイム更新 vs 再読込 → P4（非ブロッカー）

## 次

- [x] 合意 → agreed
- [ ] P4: list / anonymize の program
