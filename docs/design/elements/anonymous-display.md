---
title: H1 要素 — 匿名表示（+ アカウント属性データ枠）
kind: design
phase: P3
scope_level: H1
status: agreed
agreed_at: "2026-10-15"
slice: S1
element_id: E8
also_covers: E7
related_product: docs/design/product/charter.md
related_h1: docs/design/elements/failure-share-h1.md
related_requirements: docs/requirements/failure-share/要件.md
created: "2026-10-15"
updated: "2026-10-15"
---

# Element — 匿名表示 · E8（+ アカウント属性 · E7 データ枠）

親: [failure-share-h1](failure-share-h1.md) · charter §8「匿名表示」「アカウント属性」  
要件: FR4 · FR8

## 目的

表示上は身元を出さない。属性は内部に持てる枠だけ先に置き、初期 UI には出さない。

## Recognition

| 認識単位 | 一文 |
|----------|------|
| 匿名表示（E8） | 画面上に実名・ログインID等の身元ラベルを出さない方針 |
| アカウント属性（E7） | 職業等を内部保持しうるが、初期は非表示 |

E7 は S1 では **データ枠のみ**（個別 UI は作らない）。認識名は charter のまま分離して保持する。

## Factors

| 因子 | 種別 | 認識 | メモ |
|------|------|------|------|
| 身元ラベルを出さない | property / function | E8 | 一覧・詳細で氏名等を描画しない（FR4） |
| 表示用著者表記 | property | E8 | **空／非表示**（身元ラベル無し） |
| 内部著者キー | property | E7/E8 | 永続化・後段用。UI 非表示 |
| 属性スロット（職業等） | property | E7 | スキーマ上存在しうる · 初期 null · UI 非表示（FR8） |

## 境界・非目的

- **含む**: 表示ポリシー · 内部キー／属性スロット
- **含まない**: 「名無しの〇〇」所属ラベル本格導入（将来検討 · charter）· 実名必須 · BAD をプロフィールに載せる
- **含まない（S1）**: 本格ログイン UI・OAuth

## 認証の最小形（選択肢）

| 案 | 概要 | メリット | デメリット |
|----|------|----------|------------|
| A | 認証なし。`authorKey` も持たない完全匿名投稿 | 最短 | FR8 属性枠・「自分の投稿」が弱い |
| B（推奨） | ブラウザセッション等の **内部 authorKey** のみ。ログイン画面なし。属性スロットは空で保持可 | FR4+FR8 を満たしつつ愚痴ハードル低い | 端末またぎで著者は続かない |
| C | 初期からアカウント登録必須 | 属性・所有が明確 | MVP の気軽さと衝突 |

**推奨: B** · **決定: B**（S1 agreed 2026-10-15）  
**表示表記**: 身元ラベルを出さない（空／非表示）。「（匿名）」固定は採用しない。

## メッセージ／拡張（§7）

表示パイプラインは「失敗談 → **匿名化関数** → フィード項目」とし、匿名化を差し替え可能な function として登録する（クラス継承で縛らない）。

## ユーザー思考

> S1 agreed

## Open questions

- [x] 認証最小形 B でよいか → **yes**
- [x] 表示用表記 → **空／非表示**
- 本格アカウント → 後段（非ブロッカー）

## 次

- [x] 合意 → `status: agreed`
- [ ] H2 / P4: 匿名化 function · authorKey 付与の境界
