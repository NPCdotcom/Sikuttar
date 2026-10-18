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

1. **ダッシュボード** — ヒーロー CTA · 件数タイル（総投稿／24h／わかる）· 今日／今週／今月の類型 · 最近の失敗談（空なら誘導コピー）
2. **ダッシュ導線** — 「投稿する」→ 投稿 · 総投稿タイル → フィード · 類型 `#タグ` → 検索 · 最近の投稿 → 詳細
3. **フィード** — 一覧が出る（投稿が無ければ空メッセージ）
4. **投稿** — 本文必須 · 任意で `#タグ` を追加して投稿 → フィード／ダッシュに反映
5. **詳細** — 「詳細を見る」→「一覧へ戻る」· リアクション「わかる」「参考になる」
6. **ハッシュタグ** — カード上の `#タグ` クリック → 検索画面にそのタグの投稿
7. **検索** — 自由文クエリで近い失敗談（Jaccard）
8. **質問** — 質問を送るとテンプレ応答＋根拠（失敗談）
9. **GitHub ログイン** — サイドバー下部 → 認可後にセッション維持
10. **プロフィール** — 属性編集 · 自分の投稿 · ブックマーク · **自分の投稿の削除**

## メモ

- モバイル幅では「メニュー」でサイドバーが開く
- OAuth Callback は `https://sikuttar.npcdotcom.workers.dev/auth/github/callback`（GitHub OAuth App に登録済みであること）
- 詳細手順: [oauth-github-setup.md](./oauth-github-setup.md) · [deploy-boundary.md](./deploy-boundary.md)
