# Sikuttar — Agent Guide

> Kit: [.agents/README.md](.agents/README.md) · Tiers: [.agents/docs/CONTEXT_TIERS.md](.agents/docs/CONTEXT_TIERS.md)

## PM (IDE + external memory)

**`prop.kit.no_subagent`** · Memory: `.agents/memory/`

| Layer | Canonical |
|-------|-----------|
| L0 gate | `rules/secretary-gate` · `rules/no-subagents` |
| Every turn | `act.pm.turn_chain` · [PM_ROUTING.md](.agents/docs/PM_ROUTING.md) · `nav.yaml` |
| Loop2 | [PM_ROUTING.md](.agents/docs/PM_ROUTING.md) §Loop2 · `project-state.yaml` |
| Git | [GIT_WORKFLOW.md](.agents/docs/GIT_WORKFLOW.md) · `git_policy` in `project-state.yaml` · skills `git-reference` / `git-record` |
| Context select | [INDEX.yaml](.agents/docs/INDEX.yaml) — ≤1 L3 doc per turn by tags |
| User ↔ agent | [COLLABORATION_CONTRACT.md](.agents/docs/COLLABORATION_CONTRACT.md) — user decides, agent proposes options + recommendation |

Roles: [CURSOR_ROLES.md](.agents/docs/CURSOR_ROLES.md) · Catalog: `skills/role-skill-catalog`

User chat: **Japanese** · Kit canon: **English** — [LANGUAGE_POLICY.md](.agents/docs/LANGUAGE_POLICY.md)



---

## Project

| Field | Value |
|-------|-------|
| Name | **Sikuttar** |
| Description | 共同開発プロジェクト（概要は P0 で確定） |
| Stack | 未定（P0 以降で確定） |

## Stack docs

| Topic | Link |
|-------|------|
| Language / runtime | 未定 |
| Framework | 未定 |
| Style | 未定 |

## Lifecycle

[PROJECT_LIFECYCLE.md](docs/PROJECT_LIFECYCLE.md) · `docs/project-state.yaml` · `.agents/memory/index.yaml`

## Principles

キット既定のデザイン意味論に従う（製品固有原則は P0 以降）

### Design semantics (kit default — do not override lightly)

- **Object** = recognition / classification / spec (not mandatory `class`)
- Minimal units = **function · action · property** (factors); extend by registration / combination
- Class-centric OOP / GoF / inheritance = **optional references**, not required
- Stack (language, engine) = **means**, not philosophy core
- Canonical: [.agents/docs/DESIGN_SEMANTICS.md](.agents/docs/DESIGN_SEMANTICS.md)
- Owner philosophy (when present): recall global `npcdotcom-philosophy`

## Learned User Preferences

- Charter は節下の `>` コメントで共同推敲し、エージェントに本文へ整理・補間させる進め方を好む
- 作業チャットのスコープを分ける（例: チャーター完成専用チャットのあと、続きの P0 は別チャット）
- キットに未登録の手続きコードネームを捏造・追従しない；誤りなら訂正して実在スキル／ドキュメントで進める
- 外部ドキュメント（例: 非公開 HackMD）が読めないときは推測せず、Markdown の貼付やエクスポートを求める
- 外部講義資料は既存方針との関連／未言及を切り分けて参考にする（全面路線変更にしない）
- P3+ 設計は charter の構造（§8 認識単位・着手順・§7 スタンス）に沿わせる
- OAuth の Client ID / Secret は GitHub に載せず、Slack 等の非公開チャネルで共有する
- 共同者の不完全な PR は構造・構文・アルゴリズム／アーキテクチャをレビューしたうえで、こちらで完遂する進め方を好む
- デプロイ依存手前までを区切りにし、方針 B では審査・改修まで行いデプロイは別フェーズとする
- RAG／生成 LLM は課金を抑える；Cloudflare 有料マネージドに寄りすぎず CF 基盤上の独自実装を優先する

## Learned Workspace Facts

- H0 charter は `docs/design/product/charter.md`（`status: agreed` · 2026-10-11）。章立ては EnTeX プロジェクト概要型（§0–§11 · Facts/Assumptions · `>` 対話）
- Sikuttar（シクッター）は失敗談共有×集合知の学習向け SNS 的 Web。キャッチコピーは「しくじったら、シクッター。」
- リモートは `github.com/NPCdotcom/Sikuttar`（パブリック／ハッカソン作品想定）。共同者は NPC(NPCdotcom)、rako(takarakostar-code)、hiroto(fca2506060002-coder)
- 役割分担: FE = rako+NPC、BE = hiroto+NPC、インフラ／PM（全体）= NPC
- 配布形態 Fact: Web アプリ・利用者はブラウザのみ。スタック Assumption: TypeScript / React / Hono / Cloudflare
- MVP は投稿・閲覧。確定リアクションは「わかる」「参考になる」。BAD は非可視化・システム用（プロフィール掲載投稿にも載せない）
- UI/IA は laratter 風（フィード／作成／詳細・カード）を借り、Laravel 構成には寄せない
- Wave2（agreed）: セマンティック検索（Vectorize + Jaccard fallback）、GitHub OAuth、分類タグ、個人ブックマーク。初回 CF は Free 最小構成；Paid／生成 LLM はゲート付き後段。ローカルで足りる間は頻繁に上げない
- AI「質問」Q&A（旧称・秘書）は投稿＆類似検索への付加機能；自由質問は専用タブ、投稿起点は特定アクション。根拠は失敗談・ブックマーク・タグ；属性提示は話題関連投稿の 1/3 以上のみ
- 個人ダッシュボードは軽いプロフィール＋自分の投稿＋ブックマーク（X プロフィール欄イメージ）
- ローカル OAuth／cookie は `localhost` と `127.0.0.1` を混在させない（コールバック・Cookie ホストを揃える）

