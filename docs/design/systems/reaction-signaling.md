---
title: H2 システム — リアクション信号（SYS3）
kind: design
phase: P3
scope_level: H2
status: agreed
agreed_at: "2026-10-15"
system_id: SYS3
slice: S2
related_h2: docs/design/systems/failure-share-h2.md
related_elements:
  - docs/design/elements/limited-reaction.md
  - docs/design/elements/bad-signal.md
  - docs/design/elements/feed.md
related_requirements: docs/requirements/failure-share/要件.md
created: "2026-10-15"
updated: "2026-10-15"
---

# System — リアクション信号 · SYS3

親: [failure-share-h2](failure-share-h2.md)  
H1: [limited-reaction](../elements/limited-reaction.md)（E3）· [bad-signal](../elements/bad-signal.md)（E4）  
要件: FR5–FR7

## 目的

投稿に対する限定リアクションと BAD 内部信号を付与・永続化し、公開フィードには「わかる／参考になる」件数だけを載せる。

## Recognition

| 認識単位 | 一文 |
|----------|------|
| リアクション信号システム | E3/E4 の付与・集計・公開マスクを担う境界 |

## Factors

| 因子 | 種別 | メモ |
|------|------|------|
| validateReactionKind | function | `wakaru` \| `reference` \| `bad` |
| persistReaction | function | D1 INSERT · UNIQUE(story, author, kind) |
| countPublicReactions | function | wakaru/reference のみ集計 |
| maskBadFromPublic | function | 公開 JSON から bad を除外（集計段階で除外でも可） |
| ReactionPersisted | message | 永続化完了 |

## データフロー

```text
UI(フィード)  --POST {kind:wakaru|reference}-->  API
Any client    --POST {kind:bad}-------------->  API
  → attachAuthorKey
  → validateReactionKind
  → persistReaction(storyId, authorKey, kind)
  → emit ReactionPersisted

GET /stories
  → list stories
  → countPublicReactions(storyIds)  // no bad
  → anonymize + attach counts { wakaru, reference }
  → UI（BAD ボタンなし）
```

論理レコード `reactions`:

| フィールド | 必須 |
|------------|------|
| id | yes |
| story_id | yes |
| author_key | yes |
| kind | yes (`wakaru`\|`reference`\|`bad`) |
| created_at | yes |

## 境界・非目的

- **含む**: 付与 API · 公開件数 · BAD 内部記録 · コメント API を置かない（FR6）
- **含まない**: BAD 公開 UI · モデレーション画面 · E5 優先度 · E6 RAG

## エージェント提案

| 案 | 概要 | 推奨 |
|----|------|------|
| A | 単一 `reactions` テーブル + 公開集計マスク | **推奨** |
| B | E3/E4 を完全別マイクロサービス | 過剰 |

**推奨: A**

## Open questions

- [x] POST `/stories/:id/reactions` で 3 kind を受けるか → **yes**
- [x] GET に `counts.bad` を載せないか → **yes**

## 次

- [x] agreed
- [ ] H3 追記 · H4 program · P4/P5
