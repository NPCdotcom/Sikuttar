---
title: H1 要素 — 限定リアクション（わかる / 参考になる）
kind: design
phase: P3
scope_level: H1
status: agreed
agreed_at: "2026-10-15"
slice: S2
element_id: E3
related_product: docs/design/product/charter.md
related_h1: docs/design/elements/failure-share-h1.md
related_requirements: docs/requirements/failure-share/要件.md
created: "2026-10-15"
updated: "2026-10-15"
---

# Element — 限定リアクション · E3

親: [failure-share-h1](failure-share-h1.md) · charter §8「限定リアクション」  
要件: FR5 · FR6（自由テキスト反応 UI を置かない）

## 目的

共感（全体類似）と有用さ（原因・学び）を **2 種だけ**で示せる信号を置く。批判コメントの代替にしない。

## Recognition

| 認識単位 | 一文 |
|----------|------|
| 限定リアクション | 「わかる」「参考になる」の2種に限定した、投稿への公開信号 |

## Factors

| 因子 | 種別 | メモ |
|------|------|------|
| わかるを付与する | action | kind=`wakaru` · 全体類似の信号 |
| 参考になるを付与する | action | kind=`reference` · 有用さの信号 |
| 種別を検証する | function | 上記2種のみ公開 UI から送る |
| 公開件数を集計する | function | フィードに件数表示 |
| 反応主体キー | property | authorKey（表示しない · E8） |

## 境界・非目的

- **含む**: 2種の付与 · 公開件数 · 同 author 同 kind の二重禁止
- **含まない**: 自由記述コメント（FR6）· BAD 公開（E4）· 表示優先度式（E5）· RAG 重み本実装
- **拡張点**: 種別重みは後段 E5/E6 が購読しうる

## メッセージ／拡張

| メッセージ | 意味 |
|------------|------|
| `ReactionPersisted` | リアクション永続化完了（kind 付き） |

## エージェント提案

| 案 | 概要 | 推奨 |
|----|------|------|
| A | kind は `wakaru` / `reference` · 公開 counts に載せる | **推奨** |
| B | いいね1種に潰す | charter の軸分けを失う → 非推奨 |

**推奨: A** · **決定: A**（S2 plan 2026-10-15）

## Open questions

- [x] 2種併存（わかる＋参考になる）を許すか → **yes**（UNIQUE は story+author+kind）
- 取り消し（toggle off）→ S2 では未実装可（Open · 非ブロッカー）

## 次

- [x] 合意 → agreed
- [ ] H2 SYS3 · P4/P5
