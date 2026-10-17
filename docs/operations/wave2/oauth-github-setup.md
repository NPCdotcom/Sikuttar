---
title: Wave2 — GitHub OAuth App セットアップ
kind: operations
slice: wave2
related_issue_be: "https://github.com/NPCdotcom/Sikuttar/issues/3"
created: "2026-10-17"
updated: "2026-10-17"
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
| CF 公開後 | `https://<worker-host>/auth/github/callback`（初回デプロイ時に追記） |

API が別ポートのときは、実際に Listen している origin に合わせて Callback と `GITHUB_OAUTH_REDIRECT_URI` を揃える。

**ホストは `127.0.0.1` に統一**（`localhost` と混在させない）。Cookie が別ホスト扱いになり、OAuth 後もログインが繋がらなくなる。Vite は `apps/web/vite.config.ts` で `host: "127.0.0.1"` を指定済み。

## GitHub 上の手順（NPC）

1. GitHub → **Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**
2. 例:
   - **Application name**: `Sikuttar (local)`（本番用は別名でも可）
   - **Homepage URL**: `http://127.0.0.1:5173`（ローカル Web）
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

## CF 公開時（後工程）

- GitHub App に本番 Callback を追加（または本番用 App を分ける）
- Worker secrets: `wrangler secret put GITHUB_CLIENT_SECRET` 等（手順は初回デプロイ時に本ファイルへ追記）
