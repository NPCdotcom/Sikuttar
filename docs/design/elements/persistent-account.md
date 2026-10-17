---
title: H1 要素 — 持続アカウント紐づけ（＋属性内部編集）
kind: design
phase: P3
scope_level: H1
status: agreed
slice: wave2
element_id: E7-prime
related_h1: docs/design/elements/failure-share-h1.md
related_elements:
  - docs/design/elements/anonymous-display.md
related_requirements: docs/requirements/failure-share/要件-wave2.md
created: "2026-10-17"
agreed_at: "2026-10-17"
updated: "2026-10-17"
---

# Element — 持続アカウント紐づけ · E7′（A+B）

要件: FR13–FR15 · 既存 FR8

## 目的

- **A**: 属性（occupation 等）を本人が編集できるが、公開面に出さない（E7 延長）
- **B**: 認証 subject を DB のアカウント行に紐づけ、跨端末で同一行に戻る

公開プロフィール・表示名は作らない（E8）。

## Recognition

| 認識単位 | 一文 |
|----------|------|
| 持続アカウント紐づけ | 認証 subject ↔ accounts 行の一意対応（非表示） |
| アカウント属性 | 内部保持プロパティ（既存 E7） |

## Factors

| 因子 | 種別 | メモ |
|------|------|------|
| ログインする · ログアウトする | action | IdP 経由 |
| subject を紐づける | function | accounts.auth_subject UNIQUE |
| authorKey を移行する | function | 初回リンク時 |
| 属性を更新する | action | 公開 JSON に載せない |

## データ（論理）

```text
accounts
  id (or keep author_key as legacy key)
  auth_subject TEXT UNIQUE NULL  -- null = anonymous cookie-only
  occupation TEXT
  attributes_json TEXT
  created_at
```

cookie `author_key` は匿名セッション継続用。ログイン後は session が account id を指す。

## 境界

- **含む**: GitHub OAuth · 属性 PATCH · 紐づけ
- **含まない**: 公開プロフィール · フォロー · 実名表示

## 決定

認証: **GitHub OAuth**（2026-10-17 agreed）。
