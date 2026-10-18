---
title: Wave2 — GitHub OAuth App セットアップ
kind: operations
slice: wave2
related_issue_be: "https://github.com/NPCdotcom/Sikuttar/issues/3"
created: "2026-10-17"
updated: "2026-10-18"
---

# GitHub OAuth App セットアップ

BE 実装: [#3](https://github.com/NPCdotcom/Sikuttar/issues/3) · 設計: [persistent-account](../../design/elements/persistent-account.md)

## ルート契約（固定 · #3 が実装）

| 用途 | Method · Path |
|------|----------------|
| ログイン開始 | `GET /auth/github` |
| コールバック | `GET /auth/github/callback` |
| ログアウト | `POST /auth/logout` |

subject 形式（実装時）: `github:<numeric_user_id>`

## Callback URL

| 環境 | URL |
|------|-----|
| ローカル | `http://127.0.0.1:8787/auth/github/callback` |
| CF Free 公開 | `https://sikuttar.npcdotcom.workers.dev/auth/github/callback`（同一 origin · SPA + API） |

API が別ポートのときは、実際に Listen している origin に合わせて Callback と `GITHUB_OAUTH_REDIRECT_URI` を揃える。

**ローカルホストは `127.0.0.1` に統一**（`localhost` と混在させない）。Cookie が別ホスト扱いになり、OAuth 後もログインが繋がらなくなる。Vite は `apps/web/vite.config.ts` で `host: "127.0.0.1"` を指定済み。

**本番は Worker の公開ホストに統一**（例 `sikuttar.<subdomain>.workers.dev`）。API と SPA を別ホストに分けない（Free 初回は `[assets]` で同一 origin）。

## GitHub 上の手順（NPC）

1. GitHub → **Settings** → **Developer settings** · **OAuth Apps** → **New OAuth App**（または既存を編集）
2. 例（ローカル）:
   - **Application name**: `Sikuttar (local)`
   - **Homepage URL**: `http://127.0.0.1:5173`
   - **Authorization callback URL**: 上表のローカル URL
3. **Generate a new client secret** を作成
4. Client ID / Secret を **ローカルのみ** `.dev.vars` に書く（下記）
5. Client ID（秘密でない側）を #3 または共同者チャンネルで共有する
6. **Client Secret は Issue・チャット・git に書かない**

組織/ユーザーどちらの App でもよい。ハッカソン期間は個人 App で十分なことが多い。

## ローカル env

```bash
cp .dev.vars.example .dev.vars
# 編集: GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET / GITHUB_OAUTH_REDIRECT_URI
```

| 変数 | 意味 |
|------|------|
| `GITHUB_CLIENT_ID` | OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | Client Secret（ローカルのみ） |
| `GITHUB_OAUTH_REDIRECT_URI` | Callback と完全一致させる |
| `OAUTH_SUCCESS_REDIRECT` | 成功後の Web 戻り先（既定 `http://127.0.0.1:5173`） |

`.dev.vars` は [`.gitignore`](../../../.gitignore) 済み。コミットするのは `.dev.vars.example` のみ。

## CF Free 公開時（本番 Callback · secrets）

1. Deploy 後に Worker URL を確定する（例 `https://sikuttar.<account>.workers.dev`）
2. GitHub OAuth App に **Authorization callback URL** を追加（または本番用 App）:
   - `https://<worker-host>/auth/github/callback`
3. Homepage URL も `https://<worker-host>/` に揃える（任意だが推奨）
4. Worker secrets を投入（値は対話入力 · git に載せない）:

```bash
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
npx wrangler secret put GITHUB_OAUTH_REDIRECT_URI
# 値例: https://<worker-host>/auth/github/callback
npx wrangler secret put OAUTH_SUCCESS_REDIRECT
# 値例: https://<worker-host>/
```

5. ブラウザで `https://<worker-host>/` → ログイン → コールバック後にセッションが残ることを確認

`wrangler.toml` の `[vars]` には OAuth 秘密を書かない。`SEMANTIC_SEARCH` / `SECRETARY_QA` のみ vars。
