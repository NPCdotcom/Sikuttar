---
title: 要求定義 — failure-share 秘書照会
kind: requirement
phase: P1
status: agreed
agreed_at: "2026-10-18"
scope_level: H1
related_product: docs/design/product/charter.md
related_prior: docs/requirements/failure-share/要求-wave2.md
related_deliberation: docs/design/product/capability-secretary-qa-deliberation.md
terminology_alignment: docs/glossary/alignment-p1-failure-share.md
created: "2026-10-18"
updated: "2026-10-18"
---

# 要求定義 — 秘書照会

親合意: [要求-wave2.md](./要求-wave2.md)（R12–R17 · agreed）。本波は追加要求。**agreed 2026-10-18**。  
H0: [capability-secretary-qa-deliberation](../../design/product/capability-secretary-qa-deliberation.md)

## 背景

wave2 で意味検索・タグ・ブックマーク・属性が揃った。蓄積に基づく短い助言（秘書）を **既存本線に加えて** 置きたい。課金を膨らませない。匿名・公開属性禁止は崩さない。

## 追加要求一覧

| ID | 要求 | 優先度 | メモ |
|----|------|--------|------|
| R18 | 利用者が失敗の話題について**秘書に照会**し、短い助言と根拠を得られる | should | E12 · 専用タブ／投稿起点 |
| R19 | 助言は蓄積失敗談（および本人ブックマーク・タグ）に**根拠を紐づけ**、根拠が無ければ答えない／確認できないと示す | should | 幻覚抑制 |
| R20 | 属性の傾向は個人特定にならない集計として秘書応答に限り使え、**公開一覧・詳細・検索 JSON には出さない** | should | FR13 維持 · occupation · 1/3 |
| R21 | 秘書経路は課金を抑えられる（フラグで切り · v1 は生成 LLM なし） | should | ADR 0002 · SECRETARY_QA |

## 非要求（本波）

- 公開プロフィール · フォロー
- AI Search / R2 必須化
- 意味検索一覧（E9）の置換
- v1 での Workers AI チャット生成必須

## 成功のイメージ

- 質問や投稿起点から、似た失敗に基づく短い助言とリンクが返る
- 属性は条件を満たすときだけ文中ヒントになり、フィード等には出ない
- フラグ off や根拠不足では課金も誤答も増えない

## Open questions

- [x] 認識単位 → **E12 秘書照会**
- [x] v1 応答 → **テンプレ組み立て（LLM なし）**（2026-10-18）
- [ ] 実装波の受け入れデモ手順の詳細化
