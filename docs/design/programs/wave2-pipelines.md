---
title: H4 プログラム下地 — wave2 パイプライン
kind: design
phase: P3
scope_level: H4
status: agreed
slice: wave2
related_system: docs/design/systems/wave2-discovery.md
created: "2026-10-17"
agreed_at: "2026-10-17"
updated: "2026-10-17"
---

# Programs（下地）— wave2

実装計画（P4）前の因子列たたき。

| Program | Factors（案） |
|---------|----------------|
| 意味検索 | `embedText` · `queryVectorIndex` · `hydrateStories` · `fallbackTokenSearch` |
| 索引更新 | `upsertStoryEmbedding`（FailureStoryPersisted 購読） |
| タグ | `normalizeTag` · `attachTags` · `listByTag` |
| アカウント | `exchangeOAuth` · `linkAuthSubject` · `migrateAuthorKey` · `updateAttributes` |
| ブックマーク | `addBookmark` · `removeBookmark` · `listBookmarks` |

API 草案（実装時に確定）:

- `GET /search?q=`
- `GET /stories?tag=`
- `GET /auth/github` · `GET /auth/github/callback` · `POST /auth/logout` · `PATCH /me/attributes`（OAuth 契約: [oauth-github-setup](../../operations/wave2/oauth-github-setup.md)）
- `POST /stories/:id/bookmarks` · `DELETE ...` · `GET /me/bookmarks`
