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

## Learned Workspace Facts

- H0 charter は `docs/design/product/charter.md`（`status: agreed` · 2026-10-11）。章立ては EnTeX プロジェクト概要型（§0–§11 · Facts/Assumptions · `>` 対話）
- Sikuttar（シクッター）は失敗談共有×集合知の学習向け SNS 的 Web。キャッチコピーは「しくじったら、シクッター。」
- リモートは `github.com/NPCdotcom/Sikuttar`（パブリック／ハッカソン作品想定）。共同者は NPC(NPCdotcom) と rako(takarakostar-code)
- 配布形態 Fact: Web アプリ・利用者はブラウザのみ。スタック Assumption: TypeScript / React / Hono / Cloudflare
- MVP は投稿・閲覧；類似提示（RAG）は後段。確定リアクションは「わかる」「参考になる」。BAD は非可視化・システム用（プロフィール掲載投稿にも載せない）

