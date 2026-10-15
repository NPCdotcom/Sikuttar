---
title: H4 プログラム — リアクション付与・公開集計
kind: design
phase: P3
scope_level: H4
status: agreed
agreed_at: "2026-10-15"
slice: S2
related_system: docs/design/systems/reaction-signaling.md
related_frameworks:
  - docs/design/frameworks/hono-api.md
  - docs/design/frameworks/react-ui.md
  - docs/design/frameworks/cloudflare-platform.md
created: "2026-10-15"
updated: "2026-10-15"
---

# Program — リアクション付与・公開集計

H2: [reaction-signaling](../systems/reaction-signaling.md)（SYS3）

## 目的

`POST /stories/:id/reactions` と `GET /stories` の公開 counts を、分離可能な factor 列で実現する（FR5–FR7 · NFR3）。

## Factors（実行単位）

| Factor | 役割 |
|--------|------|
| validateReactionKind | kind 検証 |
| persistReaction | D1 永続化 |
| countPublicReactions | 公開2種の件数 |
| maskBadFromPublic | 公開形に bad を載せない（count 側で除外でも可） |

## 境界

- **含む**: 上記 · UI のわかる／参考になるボタン
- **含まない**: BAD 公開ボタン · コメント · 取り消し必須化
