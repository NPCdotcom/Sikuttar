---
title: H2 システム — 発見・アイデンティティ（wave2）
kind: design
phase: P3
scope_level: H2
status: agreed
slice: wave2
related_h2: docs/design/systems/failure-share-h2.md
related_elements:
  - docs/design/elements/semantic-search.md
  - docs/design/elements/classification-tag.md
  - docs/design/elements/bookmark.md
  - docs/design/elements/persistent-account.md
related_requirements: docs/requirements/failure-share/要件-wave2.md
created: "2026-10-17"
agreed_at: "2026-10-17"
updated: "2026-10-17"
---

# System overview — wave2（発見・アイデンティティ）

S1–S3 の SYS1–SYS4 に、次を **追加システム**として載せる。

| ID | システム | 合成 |
|----|----------|------|
| SYS5 | 意味検索システム | E9 |
| SYS6 | 分類タグシステム | E10 |
| SYS7 | 個人保存システム | E11 |
| SYS8 | 持続アカウントシステム | E7′ · E7 · E8 |

## データフロー（要約）

```text
[Browser]
  ├─ search q ──────────▶ SYS5 → Vectorize/AI or fallback → anonymize
  ├─ filter tag ────────▶ SYS6 → D1 join stories
  ├─ bookmark ──────────▶ SYS7 (auth) → D1 bookmarks
  └─ login / patch attrs ▶ SYS8 → IdP + accounts

[on story persist]
  SYS1 → emit Persisted → SYS5 index upsert · SYS6 tags optional
```

## 境界

- 公開面に auth_subject · occupation · ブックマーク他人分を出さない
- SYS5 は FW3（CF）にバインディング。未設定時フォールバック必須
