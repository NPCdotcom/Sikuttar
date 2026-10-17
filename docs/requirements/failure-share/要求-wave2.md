---
title: 要求定義 — failure-share wave 2（検索・アカウント・タグ・保存）
kind: requirement
phase: P1
status: agreed
agreed_at: "2026-10-17"
scope_level: H1
related_product: docs/design/product/charter.md
related_prior: docs/requirements/failure-share/要求.md
related_deliberation: docs/design/product/capability-wave2-deliberation.md
terminology_alignment: docs/glossary/alignment-p1-failure-share.md
created: "2026-10-17"
updated: "2026-10-17"
---

# 要求定義 — wave 2

親合意: [要求.md](./要求.md)（R1–R11 · agreed）。本波は追加要求。**agreed 2026-10-17**。

## 背景

S1–S3（投稿・リアクション・関連提示）のあと、発見性・跨端末・索引・個人メモの必要が出た。charter の匿名・非難禁止は崩さない。

## 追加要求一覧

| ID | 要求 | 優先度 | メモ |
|----|------|--------|------|
| R12 | 蓄積失敗談を**意味的に近いものとして検索**できる（キーワード一致だけに依存しない） | should | 厚い検索 · CF 前提 |
| R13 | 内部のアカウント属性を利用者が編集できるが、**一覧・詳細に表示しない** | should | アカウント A · E7 |
| R14 | 認証により持続アカウントを持ち、DB のアカウント行に**紐づけ**できる（公開身元は出さない） | should | アカウント B · 最小 |
| R15 | 失敗談に分類用のタグ（通称ハッシュタグ）を付け、それで辿れる | should | 索引 · 炎上導線にしない |
| R16 | ログイン利用者が失敗談を**個人の非公開ブックマーク**として保存・一覧できる | should | R14 前提 |
| R17 | 意味検索は Cloudflare 上で運用可能とし、未設定時は劣化フォールバックがある | should | 料金・デプロイ配慮 |

## 非要求（本波）

- 公開プロフィールページ · フォローグラフ
- 検索・タグ結果への著者ラベル表示
- 無制限自由タグのモデレーション無し運用を必須にしない
- ブックマークの公開・共有必須化

## 成功のイメージ

- クエリやタグから「似た失敗」「同じ類型の失敗」に辿れる
- 別端末でも同じ保存・属性に戻れる（ログイン後）
- 画面上は相変わらず匿名で、ダメ出しコメントは増えない

## Open questions

- [x] 認証手段 → **GitHub OAuth**（2026-10-17）
- [x] タグ初期方針 → **候補語彙＋任意追加**（2026-10-17）
- [x] CF Paid / デプロイタイミング → **最低限公開できる段階でまとめて上げる**（境界は ADR / deliberation に記載 · 2026-10-17）

## Facts / Assumptions

**Facts**: 親要求 agreed · S1–S3 実装済み · 匿名 must · wave2 要求 agreed 2026-10-17  
**Assumptions**: CF Workers + D1 +（意味検索本番時）Vectorize / Workers AI · ローカルはフォールバック可

## 次

- [x] ユーザー確認 → agreed
- [x] [要件-wave2.md](./要件-wave2.md)
