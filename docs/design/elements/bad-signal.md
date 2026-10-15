---
title: H1 要素 — BAD シグナル（非表示・システム用）
kind: design
phase: P3
scope_level: H1
status: agreed
agreed_at: "2026-10-15"
slice: S2
element_id: E4
related_product: docs/design/product/charter.md
related_h1: docs/design/elements/failure-share-h1.md
related_requirements: docs/requirements/failure-share/要件.md
created: "2026-10-15"
updated: "2026-10-15"
---

# Element — BAD シグナル · E4

親: [failure-share-h1](failure-share-h1.md) · charter §8「BAD シグナル」  
要件: FR7

## 目的

負の内部信号を記録できるようにし、**公開数値・公開ランキング・プロフィール掲載投稿にも載せない**。

## Recognition

| 認識単位 | 一文 |
|----------|------|
| BAD シグナル | 公開 UI に出さない、システム内部用の負の信号 |

## Factors

| 因子 | 種別 | メモ |
|------|------|------|
| BAD を内部記録する | action / function | kind=`bad` · Store に書く |
| 公開面からマスクする | function | 一覧 JSON・UI に件数を出さない |
| 反応主体キー | property | authorKey（表示しない） |

## 境界・非目的

- **含む**: 内部永続化 · 公開マスク（FR7）
- **含まない**: BAD ボタンの公開 UI · モデレーション画面 · ランキング · プロフィール上の BAD 表示
- **S2 の API**: `POST .../reactions` で `kind=bad` を受付可能だが、公開クライアントは送らない。応答・`GET /stories` に bad 件数キーを載せない

## メッセージ／拡張

| メッセージ | 意味 |
|------------|------|
| `BadSignalPersisted` | 内部 BAD 記録完了（公開購読しない） |

## エージェント提案

| 案 | 概要 | 推奨 |
|----|------|------|
| A | E3 と同テーブル・同 API · 公開集計から bad を除外 | **推奨** — 関数追加で拡張 |
| B | BAD 専用テーブル＋管理 UI まで S2 で作る | 工期超過 → 非推奨 |

**推奨: A** · **決定: A**

## Open questions

- [x] 公開 UI に BAD を出さないか → **yes**（FR7）
- 誰が bad を付けるか（モデレーション権限）→ 後段（Open · 非ブロッカー）

## 次

- [x] 合意 → agreed
- [ ] H2 SYS3 · P4/P5
