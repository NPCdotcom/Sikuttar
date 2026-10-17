---
title: 要件定義 — failure-share wave 2
kind: requirement-spec
phase: P2
status: agreed
agreed_at: "2026-10-17"
scope_level: H1
related_要求: 要求-wave2.md
related_prior: docs/requirements/failure-share/要件.md
related_deliberation: docs/design/product/capability-wave2-deliberation.md
design_constraint: "charter §8 拡張は関数追加。公開身元・コメント・BAD公開は禁止のまま"
created: "2026-10-17"
updated: "2026-10-17"
---

# 要件定義 — wave 2

親要求: [要求-wave2.md](./要求-wave2.md)（agreed · 2026-10-17）  
既存: [要件.md](./要件.md)（FR1–FR10 agreed）は維持。本波は **FR11–** を追加。

## スコープ

### In scope

- 意味検索（ベクトル）＋未設定時フォールバック
- 属性内部編集（非表示）
- 持続アカウントと DB 紐づけ（最小認証）
- 分類タグの付与・一覧絞り込み
- ログインユーザの非公開ブックマーク
- CF デプロイを視野に入れた構成（バインディング・フラグ）

### Out of scope

- 公開プロフィール · フォロー · 表示名
- コメント · BAD 公開
- 画像／動画必須化
- S4 表示優先度の本式確定（別スライスのまま可）

## 機能要件

| ID | 要件 | 対応要求 | 優先 | 検証方法 |
|----|------|----------|------|----------|
| FR11 | 利用者は検索クエリを送り、意味的に近い失敗談の一覧を得られる | R12 | should | 手動: 類似トピックの投稿が上位に来る（合成データ可） |
| FR12 | Vectorize／Workers AI 未設定時でも検索 API がエラーだけで死なず、フォールバック結果を返す | R17 | should | 設定オフで 200 + 非空または空配列（仕様どおり） |
| FR13 | 認証済み利用者は occupation 等の属性を更新できるが、フィード／詳細／検索結果に属性・表示名が出ない | R13 | should | UI/API: 更新可 · 公開 JSON に属性キーなし |
| FR14 | 認証 subject が accounts（または同等）行に一意に紐づく。同一 subject で再ログインすると同じ行に戻る | R14 | should | 手動: 紐づけ後、属性・ブックマークが復元 |
| FR15 | 既存 cookie authorKey 由来の投稿は、初回紐づけ時に同一アカウントへ移行または関連付けできる | R14 | should | レビュー/IT: 移行方針が文書化され、デモで破綻しない |
| FR16 | 投稿に分類タグを 0 個以上付与できる。タグで投稿を絞り込める | R15 | should | 手動: 付与 → タグ一覧/フィルタで当該投稿が出る |
| FR17 | 初期タグは**推奨語彙**を提示する（自由入力は許可してよいが、空の無限語彙を必須にしない） | R15 | should | UI: 候補あり |
| FR18 | 認証済み利用者は投稿をブックマーク／解除でき、自分のブックマーク一覧を見られる | R16 | should | 手動: 保存→一覧→解除。他者から見えない |
| FR19 | 未認証ではブックマーク API は拒否する（cookie のみの偽ブックマークを正式機能にしない） | R16 | should | 401/403 |

## 非機能要件

| ID | 要件 | 対応要求 | 優先 | 検証方法 |
|----|------|----------|------|----------|
| NFR5 | 意味検索の本番経路は Cloudflare（Workers + D1 + Vectorize + Workers AI）を第一候補とする | R17 | should | 設計/デプロイ手順に記載 |
| NFR6 | 料金: Free 枠で試作可能とし、Vectorize 本番は Workers Paid 要否を README/ADR に明記する | R17 | should | ADR または platform 設計に記載 |
| NFR7 | 埋め込み・索引更新は投稿永続化の拡張として関数追加できる | R11 | should | 設計レビュー: factor 境界 |
| NFR8 | 認証プロバイダは交換可能な境界（subject 文字列）に閉じる | R14 | should | 設計: IdP 固有ロジックが UI に漏れない |

## 受け入れ（P2→P3）

1. FR11–FR19 · NFR5–NFR8 が Open をブロッカーにしていない
2. 匿名（FR4）· コメント禁止（FR6）· BAD 非公開（FR7）と矛盾する要件が無い
3. 認識単位 E9–E11 · E7′ が設計ドキュメントに落ちている

## エージェント提案（認証）

| 案 | 概要 | 推奨 |
|----|------|------|
| A | 外部 OAuth（GitHub 等）→ subject = provider:userId | ハッカソン共同者に合う |
| B | Magic link / Email OTP | 実装重い |
| C | Cloudflare Access | 運用向き・公開デモには重い場合あり |

**決定: A（GitHub OAuth）** — 2026-10-17 ユーザー合意。

## タグ方針

**決定**: 初期は候補チップ  
`デプロイ` · `レビュー` · `コミュニケーション` · `見積もり` · `オンボーディング` · `インシデント` · `テスト`  
＋任意追加を許可。完全自由のみはしない。

## Cloudflare デプロイ境界（決定）

| 段階 | 方針 |
|------|------|
| ローカル開発 | D1 + 意味検索フォールバック。**頻繁な CF デプロイはしない** |
| CF デプロイ | **最低限公開できるまとまり**ができたとき（認証・検索本番経路・タグ・ブックマークがデモ可能）にまとめて上げる |
| Workers Paid / Vectorize | 意味検索を **本番経路で公開オン**にする直前に契約・インデックス作成 |

詳細: [ADR 0001](../../adr/0001-cloudflare-semantic-search-cost.md)

## Open questions

- [x] 認証案 → GitHub OAuth
- [x] Paid / デプロイ境界 → 上記
- [x] タグ候補 → 上記リスト

## ゲート

- [x] ユーザー確認 → `status: agreed`
- [x] P3 設計（elements/systems）へ · agreed
