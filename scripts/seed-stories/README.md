# 失敗談シード台本（100件目標・ローカル優先）

本番へ一気に流して Free 枠／アクセスを爆発させないため、**先に台本をローカルで作る**。

## 成果物

| ファイル | 内容 |
|----------|------|
| `playbook.json` | 投稿ドラフト 100 件（`body` / `situation` / `cause` / `tags`） |
| `sources.json` | Zenn / Qiita から拾った題材一覧 |
| `build-playbook.mjs` | Advent Calendar ダンプ等から台本再生成 |
| `post.mjs` | 投入スクリプト（**既定は dry-run**） |

## 方針

- 出典は [Zenn](https://zenn.dev) / [Qiita](https://qiita.com)（やらかし Advent・検索）
- 原文の丸写しはしない（要約・台本）。各稿に `出典の学び: URL` を付ける想定
- `fidelity: paraphrase` … 記事を読んで要約済み
- `fidelity: title_draft` … タイトル起点の草案（`needs_review: true`）→ 投入前に推敲

## 使い方

```bash
# 台本の再生成 → 推敲
node scripts/seed-stories/build-playbook.mjs
node scripts/seed-stories/refine-playbook.mjs

# 中身確認のみ（POST しない）
node scripts/seed-stories/post.mjs

# ローカル（要: wrangler d1 migrations apply sikuttar --local && npm run dev:api）
set SIKUTTAR_AUTHOR_KEY=11111111-1111-4111-8111-111111111111
node scripts/seed-stories/post.mjs --target local --limit 20

# 本番は明示フラグ必須・小分け（既存 curated 8 件を除く例）
set SIKUTTAR_AUTHOR_KEY=<linked-author-key>
node scripts/seed-stories/post.mjs --target prod --i-understand-prod --skip-curated --offset 0 --limit 10
```

## 本番到達 100

既存 8 + `--skip-curated` で r\* を投入 + curated の未投入分（c09–c16）を追加。
