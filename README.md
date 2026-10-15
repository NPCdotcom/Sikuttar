# Sikuttar（シクッター）

失敗談共有 × 集合知 — 「しくじったら、シクッター。」

## スタック（S1 MVP）

- API: Cloudflare Workers + Hono + D1
- UI: Vite + React（`apps/web`）

## セットアップ

```bash
npm install
npx wrangler d1 migrations apply sikuttar --local
```

## ローカル起動

別ターミナルで:

```bash
# API (http://127.0.0.1:8787)
npm run dev:api

# Web (http://127.0.0.1:5173) — /stories と /health は API へ proxy
npm run dev:web
```

確認:

- `curl http://127.0.0.1:8787/health` → `{"ok":true}`
- ブラウザで `http://127.0.0.1:5173`

## デモ（投稿→閲覧）

1. API と Web を起動
2. フォームに失敗談本文を入れて投稿（状況・原因は任意）
3. 一覧に表示されることを確認（著者ラベルは出ない）

## Plans

実装単位: [.agents/plans/README.md](.agents/plans/README.md)
