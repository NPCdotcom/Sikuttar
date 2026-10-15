---
title: H4 プログラム — 関連失敗パイプライン
kind: design
phase: P3
scope_level: H4
status: agreed
agreed_at: "2026-10-15"
slice: S3
related_system: docs/design/systems/related-retrieval.md
related_frameworks:
  - docs/design/frameworks/hono-api.md
  - docs/design/frameworks/react-ui.md
  - docs/design/frameworks/cloudflare-platform.md
created: "2026-10-15"
updated: "2026-10-15"
---

# Program — 関連失敗パイプライン

H2: [related-retrieval](../systems/related-retrieval.md)（SYS4）

## 目的

`GET /stories/:id/related` とフィード上の「関連する失敗談」展開を、分離可能な factor 列で実現する（FR10）。

## Factors

| Factor | 役割 |
|--------|------|
| tokenizeForSimilarity | テキスト → トークン集合 |
| scoreStorySimilarity | Jaccard |
| findRelatedStories | 候補採点 · top-K · wakaru ブースト |

## 差し替えフック

`findRelatedStories` の Store 走査実装を、後段 Vectorize／Workers AI 呼び出しに置換可能（シグネチャ維持）。

## 境界

- **含む**: API · UI 展開 · UT
- **含まない**: ベクトル本接続 · BAD 公開
