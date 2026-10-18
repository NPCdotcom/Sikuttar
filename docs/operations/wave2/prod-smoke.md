---
title: Wave2 — 本番スモーク手順
kind: operations
slice: wave2
created: "2026-10-18"
updated: "2026-10-18"
---

# 本番スモーク（共同者向け）

公開 URL: **https://sikuttar.npcdotcom.workers.dev**

課金オフ: `SEMANTIC_SEARCH=fallback`（Jaccard）· `SECRETARY_QA=on`（テンプレのみ）· Vectorize / 生成 LLM なし。

## チェックリスト

1. **ダッシュボード** — 空パネルが表示される（プレースホルダ）
2. **フィード** — 一覧が出る（投稿が無ければ空メッセージ）
3. **投稿** — 本文必須 · 任意で `#タグ` を追加して投稿 → フィードに出る
4. **詳細** — 「詳細を見る」→「一覧へ戻る」· リアクション「わかる」「参考になる」
5. **ハッシュタグ** — カード上の `#タグ` クリック → 検索画面にそのタグの投稿
6. **検索** — 自由文クエリで近い失敗談（Jaccard）
7. **質問** — 質問を送るとテンプレ応答＋根拠（失敗談）
8. **GitHub ログイン** — サイドバー下部 → 認可後にセッション維持
9. **プロフィール** — 属性編集 · 自分の投稿 · ブックマーク · **自分の投稿の削除**

## メモ

- モバイル幅では「メニュー」でサイドバーが開く
- OAuth Callback は `https://sikuttar.npcdotcom.workers.dev/auth/github/callback`（GitHub OAuth App に登録済みであること）
- 詳細手順: [oauth-github-setup.md](./oauth-github-setup.md) · [deploy-boundary.md](./deploy-boundary.md)
