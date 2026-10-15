---
title: H2 システム — 失敗談投稿（SYS1）
kind: design
phase: P3
scope_level: H2
status: agreed
agreed_at: "2026-10-15"
system_id: SYS1
slice: S1
related_h2: docs/design/systems/failure-share-h2.md
related_elements:
  - docs/design/elements/failure-story.md
  - docs/design/elements/anonymous-display.md
related_requirements: docs/requirements/failure-share/要件.md
created: "2026-10-15"
updated: "2026-10-15"
---

# System — 失敗談投稿 · SYS1

親: [failure-share-h2](failure-share-h2.md)  
H1: [failure-story](../elements/failure-story.md)（E1 agreed）· [anonymous-display](../elements/anonymous-display.md)（authorKey · E8/E7）  
要件: FR1 · FR3 · FR8（属性スロット空で可）

## 目的

ブラウザから失敗談を受け取り、検証・著者キー付与のうえ永続化し、購読可能な永続化完了メッセージを出す。

## Recognition

| 認識単位 | 一文 |
|----------|------|
| 失敗談投稿システム | E1 の投稿・永続化と、内部 authorKey 付与を担う境界 |

クラス階層の「PostService」必須ではない。関数とメッセージの組み合わせでよい。

## Factors

| 因子 | 種別 | メモ |
|------|------|------|
| 入力を受ける | action | body 必須 · situation?/cause? |
| 本文を検証する | function | 空本文は拒否 |
| authorKey を付与する | function | セッション由来 · UI 非表示（認証 B） |
| 永続化する | function | Store へ書く（FR1） |
| FailureStorySubmitted | message | 検証通過時点（任意） |
| FailureStoryPersisted | message | 永続化成功 · SYS2 等が購読 |

## モジュール境界 · データフロー

```text
UI(投稿フォーム)
  → receiveSubmit({ body, situation?, cause? })
  → validateBody
  → attachAuthorKey(session)
  → persistFailureStory(record)
  → emit FailureStoryPersisted({ id, createdAt, ... })
Store
```

レコード（論理）:

| フィールド | 必須 | 由来 |
|------------|------|------|
| id | yes | 生成 |
| body | yes | 入力 |
| situation | no | 入力 |
| cause | no | 入力 |
| createdAt | yes | 生成 |
| authorKey | yes* | セッション（*MVP では常に付与） |
| attributesSlot | no | E7 · 初期 null |

## 境界・非目的

- **含む**: 投稿経路 · 検証 · 永続化 · メッセージ
- **含まない**: フィード描画 · 匿名化の表示適用（SYS2）· リアクション · ログイン画面

## エージェント提案

| 案 | 概要 | 推奨 |
|----|------|------|
| A | 上記パイプラインを純関数列 + Store port | **推奨** |
| B | 巨大 PostController に UI/Store/一覧を同居 | 拡張困難 → 非推奨 |

**推奨: A**

## ユーザー思考

> 

## Open questions

- [x] SYS1 パイプラインでよいか → **yes**
- Store 技術（D1 等）→ H3/P4（Assumption スタックに従う · 非ブロッカー）

## 次

- [x] 合意 → agreed
- [ ] P4: persist / validate の program
