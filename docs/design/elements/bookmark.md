---
title: H1 要素 — 個人保存（ブックマーク）
kind: design
phase: P3
scope_level: H1
status: agreed
slice: wave2
element_id: E11
related_h1: docs/design/elements/failure-share-h1.md
related_requirements: docs/requirements/failure-share/要件-wave2.md
created: "2026-10-17"
agreed_at: "2026-10-17"
updated: "2026-10-17"
---

# Element — 個人保存 · E11

要件: FR18 · FR19

## 目的

後で読み返したい失敗談を、本人だけが持つ非公開リストに残す。

## Recognition

| 認識単位 | 一文 |
|----------|------|
| 個人保存 | 認証済み利用者と失敗談の非公開保存関係 |

## Factors

| 因子 | 種別 | メモ |
|------|------|------|
| 保存する · 解除する | action | UNIQUE(account, story) |
| 一覧する | function | 本人のみ |

## 境界

- **含む**: 認証必須の CRUD
- **含まない**: 公開ブックマーク · シェア · 未ログイン正式保存
- **依存**: E7′ 持続アカウント紐づけ
