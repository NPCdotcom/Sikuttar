# Sikuttar（シクッター）

失敗談共有 × 集合知 — 「しくじったら、シクッター。」

共同開発（[NPCdotcom/Sikuttar](https://github.com/NPCdotcom/Sikuttar)）。`main` への反映は PR レビュー（Code Owners: NPCdotcom）前提です。

| 役割 | 担当 |
|------|------|
| フロント | rako ([takarakostar-code](https://github.com/takarakostar-code)) · NPC ([NPCdotcom](https://github.com/NPCdotcom)) |
| バック | hiroto ([fca2506060002-coder](https://github.com/fca2506060002-coder)) · NPC |
| インフラ・プロジェクト進行（全体） | NPC |

## いま動くもの

| 画面 | できること |
|------|------------|
| フィード | 失敗談カード一覧 · 「わかる」「参考になる」 |
| 投稿 | 本文必須 · 状況／原因は任意 |
| 詳細 | 全文 · リアクション · 関連する失敗談（簡易類似） |

製品ルール（要約）:

- 表示は**匿名**（著者名・プロフィールは出さない）
- 自由記述コメントは**置かない**
- BAD は内部用で、公開 UI に件数を出さない

## スタック

- API: Cloudflare Workers + Hono + D1（`src/` · `migrations/`）
- UI: Vite + React（`apps/web/`）— 画面ステート切替（ルータ未使用）

## セットアップ

前提: Node.js 22 前後 · npm

```bash
npm install
npx wrangler d1 migrations apply sikuttar --local
```

## ローカル起動

別ターミナルで:

```bash
# API — 通常 http://127.0.0.1:8787（空きがなければ別ポート）
npm run dev:api

# Web — http://localhost:5173 （/stories · /health を API へ proxy）
npm run dev:web
```

確認:

- `curl http://127.0.0.1:8787/health` → `{"ok":true}`
- ブラウザで `http://localhost:5173`（フィード／投稿／詳細をヘッダから切替）

## デモ手順

1. API と Web を起動
2. **投稿** から失敗談を送る（本文のみでも可）
3. **フィード** でカード表示・リアクションを確認
4. **詳細を見る** → 関連失敗談を確認

## テスト・ビルド

```bash
npm test
npm run build -w apps/web
```

CI: `.github/workflows/ci.yml`（`main` への push / PR）

## Wave2 インフラ

ローカルで足りる間は **Cloudflare へ頻繁にデプロイしない**（公開デモ一式が揃ってからまとめて）。詳細: [docs/operations/wave2/](docs/operations/wave2/README.md)

| 項目 | 場所 |
|------|------|
| デプロイ境界 | [deploy-boundary.md](docs/operations/wave2/deploy-boundary.md) |
| GitHub OAuth | [oauth-github-setup.md](docs/operations/wave2/oauth-github-setup.md) · `.dev.vars.example` を `.dev.vars` にコピー |
| Paid / Vectorize | [vectorize-paid-gate.md](docs/operations/wave2/vectorize-paid-gate.md)（本番オン直前まで保留） |

`SEMANTIC_SEARCH` 既定は `fallback`（[`wrangler.toml`](wrangler.toml)）。

## ドキュメント

| 用途 | 場所 |
|------|------|
| 製品チャーター | [docs/design/product/charter.md](docs/design/product/charter.md) |
| 要求・要件 | [docs/requirements/failure-share/](docs/requirements/failure-share/) |
| 設計（H0–H4） | [docs/design/README.md](docs/design/README.md) |
| Wave2 運用 | [docs/operations/wave2/](docs/operations/wave2/README.md) |
| 実装プラン | [.agents/plans/README.md](.agents/plans/README.md) |
| エージェント向け | [AGENTS.md](AGENTS.md) |

## 主な API（ローカル）

| Method | Path | 用途 |
|--------|------|------|
| GET | `/health` | 疎通 |
| GET | `/auth/github` | GitHub OAuth 開始 |
| GET | `/auth/github/callback` | OAuth コールバック |
| POST | `/auth/logout` | ログアウト（DB 紐づけは残す） |
| GET | `/auth/session` | `{ loggedIn }`（IdP 識別子なし） |
| GET | `/stories` | 一覧（匿名＋公開リアクション件数） |
| POST | `/stories` | 投稿 |
| POST | `/stories/:id/reactions` | `wakaru` / `reference` /（内部）`bad` |
| GET | `/stories/:id/related` | 関連失敗（D1 簡易類似） |

## ブランチ運用（目安）

- 機能は `plan/<slug>` などで作業 → PR → `main`
- エージェントキット由来のローカル差分（`.agents/memory` 等）はコミット対象外
