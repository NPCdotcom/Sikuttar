---
title: H1 要素 — 分類タグ（ハッシュタグ）
kind: design
phase: P3
scope_level: H1
status: agreed
slice: wave2
element_id: E10
related_h1: docs/design/elements/failure-share-h1.md
related_requirements: docs/requirements/failure-share/要件-wave2.md
created: "2026-10-17"
agreed_at: "2026-10-17"
updated: "2026-10-17"
---

# Element — 分類タグ · E10

要件: FR16 · FR17

## 目的

失敗談を類型で辿るためのラベル。SNS の話題タグ炎上ではなく、**学びの索引**。

## Recognition

| 認識単位 | 一文 |
|----------|------|
| 分類タグ | 失敗談に付く、検索・絞り込み用の短いラベル |

通称「ハッシュタグ」可。UI 表示は `#デプロイ` 形式でもよい。

## Factors

| 因子 | 種別 | メモ |
|------|------|------|
| タグを付与する | action | 投稿時・編集時 |
| タグで絞り込む | function | GET /stories?tag= |
| 推奨語彙を提示する | property / function | 候補チップ |

## 境界

- **含む**: 多対多（story–tag）· フィルタ
- **含まない**: タグフォロー · タグランキング炎上 UI
- **初期語彙（決定 2026-10-17）**: デプロイ · レビュー · コミュニケーション · 見積もり · オンボーディング · インシデント · テスト

## 決定

**候補＋任意追加**（案 A）。完全自由のみは初期採用しない。
