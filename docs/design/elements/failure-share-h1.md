---
title: H1 要素概要 — failure-share（charter §8 準拠）
kind: design
phase: P3
scope_level: H1
status: agreed
agreed_at: "2026-10-15"
related_product: docs/design/product/charter.md
related_requirements: docs/requirements/failure-share/要件.md
structure_ref: "charter §8 認識単位 · 着手順 · §7 設計スタンス"
created: "2026-10-15"
updated: "2026-10-15"
---

# H1 要素概要 — failure-share

Semantics: [.agents/docs/DESIGN_SEMANTICS.md](../../../.agents/docs/DESIGN_SEMANTICS.md)  
親: [charter](../product/charter.md) §8 · [要件](../../requirements/failure-share/要件.md)（agreed）

> **構造ルール**: 本ドキュメントの認識単位は charter §8 と **1:1**。別名の並行ツリーやクラス階層での再分類はしない。

## 目的

失敗談の投稿・閲覧を核に、限定リアクションと後段の類似提示／表示優先度へ **関数追加で拡張**できる骨格を置く。

## Recognition（charter §8 転記 · 骨格）

| # | 認識単位（charter） | 一文 | MVP | 着手順 |
|---|---------------------|------|-----|--------|
| E1 | 失敗談（投稿） | 状況・結果（原因は任意）を含む学びの種としての投稿単位 | must | 1 |
| E2 | フィード／タイムライン | 失敗談の一覧表示面 | must | 1 |
| E3 | 限定リアクション（わかる / 参考になる） | 共感（全体類似）と有用さ（原因・学び）を分ける信号 | should | 2 |
| E4 | BAD シグナル（非表示・システム用） | 公開数値にしない負の内部信号 | should | 2 |
| E5 | 表示優先度 | ベイズ平均＋時間減退＋種別重みで並び／露出を導く | could | 4 |
| E6 | 関連失敗の提示（RAG · 後段） | 蓄積失敗談からの類似／関連提示 | could | 3 |
| E7 | アカウント属性（内部保持 · 非表示） | 職業等を内部に持ちうるが初期は出さない | should | 1〜2（データのみ） |
| E8 | 匿名表示 | 画面上は身元を出さない表示方針 | must | 1 |

スタック（TS / React / Hono / Cloudflare）は charter §7 の手段であり、上表の認識単位には入れない。

## Factors（たたき · 種別のみ）

| 認識 | 因子例 | 種別 | メモ |
|------|--------|------|------|
| E1 失敗談 | 投稿する · 永続化する | action / function | 本文必須 · 状況・原因は任意 |
| E1 | 本文 · 状況? · 原因? · 作成時刻 | property | FR1 · FR3 |
| E2 フィード | 一覧する · 並び替える | action | MVP は既定順（新着等）で可 |
| E8 匿名表示 | 身元ラベルを出さない | property / function | FR4 · E7 と対 |
| E3 リアクション | わかるを付与 · 参考になるを付与 | action | 自由テキスト反応は置かない |
| E4 BAD | 内部記録する · 公開UIに載せない | action / property | プロフィール掲載分にも載せない |
| E5 表示優先度 | 優先度を算出する | function | 式は後段 · 差し込み点だけ先に |
| E6 関連失敗 | 類似を照会する · 提示する | function / action | 後段 · API境界を先に文書化可 |

## 境界・非目的

- **含む**: §8 の認識単位とその因子の登録／組み合わせ
- **含まない**: 糾弾コメントスレ · BAD 公開ランキング · 職種横断本格展開 · クラス中心の必須 OOP 設計
- **設計スタンス（§7）**: メッセージ駆動 · 開放閉鎖（拡張に寛容）· 関数追加優先

## 着手スライス（charter 着手順）

| Slice | 認識 | 要件 | 状態 |
|-------|------|------|------|
| S1 | E1 · E2 · E8（+ E7 データ枠） | FR1–FR4 · NFR1–2 | **Conditional Go** → [failure-story](failure-story.md) · [feed](feed.md) · [anonymous-display](anonymous-display.md) · H2: [failure-share-h2](../systems/failure-share-h2.md) |
| S2 | E3 · E4（体験ガード） | FR5–FR7 | **Go** → [limited-reaction](limited-reaction.md) · [bad-signal](bad-signal.md) · H2: [reaction-signaling](../systems/reaction-signaling.md) · [review](../../reviews/s2-reactions-p6.md) |
| S3 | E6 | FR10 | **Go** → [related-failure](related-failure.md) · H2: [related-retrieval](../systems/related-retrieval.md) · [review](../../reviews/s3-related-p6.md) |
| S4 | E5 | FR9 | 後 |
| wave2 | E9–E11 · E7′ | FR11–FR19 | **agreed** → [capability-wave2-deliberation](../product/capability-wave2-deliberation.md) · [要求-wave2](../../requirements/failure-share/要求-wave2.md) · [要件-wave2](../../requirements/failure-share/要件-wave2.md) |

## エージェント提案

| 案 | 概要 | 推奨 |
|----|------|------|
| A | H1 は本概要1枚に留め、S1 だけ個別 element ファイルへ展開 | **推奨** — charter 骨格を崩さず工期に合う |
| B | §8 全認識を個別ファイル化してから実装 | 網羅的だが発表期限に重い |
| C | 認識を「Post / Feed / User」等の一般SNS名にリネーム | charter 構造から逸脱 → **採用しない** |

**推奨: A**

## ユーザー思考

> 要件 agreed ただし設計は charter の構造に注意

## Open questions

- [x] H1 概要の骨格（E1–E8 = charter §8）でよいか → **yes**（2026-10-15）
- [x] 次は S1（失敗談 · フィード · 匿名表示）の個別設計へ進んでよいか → **yes**
- 認証の最小形（E7/E8）→ [anonymous-display.md](anonymous-display.md) で選択肢

## 次

- [x] 本概要 `agreed`
- [ ] S1 個別設計の確認 → agreed
- [ ] 必要なら H2 systems / H3 frameworks · または P4 plan
