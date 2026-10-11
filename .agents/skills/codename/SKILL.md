---
name: codename
description: "Use when the user message contains a full-form codename 区分-固有名-番号 (e.g. 手順-スタートアップ-2). Dispatch the registered package brief and skip Loop1 brief inference."
---

# Codename dispatch（`act.pm.codename_dispatch`）

**Role**: PM · **Owner**: this skill · Why: [`docs/CODENAMES.md`](../../docs/CODENAMES.md)

When the utterance matches a registered full-form codename, use the package brief instead of inventing one.

## Steps

1. **Extract** — match `^(手順|プロトコル|オペレーション)-[^\s\-]{2,8}-\d{1,2}$` in the user message (take the first full form). Variant digit selects `variants.<n>`.
2. **Resolve** — read [`registry/packages/index.yaml`](../../registry/packages/index.yaml) → `id` → load `registry/packages/<id>.yaml` only (do not load all packages).
3. **Gate** — `kind: procedure` → run; `protocol` / `operation` → confirm with options + recommended first (`docs/COLLABORATION_CONTRACT.md`). Honor `gate.confirm_points`.
4. **Inputs** — if `inputs.required` missing: `on_missing: ask` → ask once and stop (do not guess); `elicit` → first factor is the dialogue act.
5. **Execute** — weave `caveats` (prop ids) → run `brief.skills` / `brief.factors` via `prop.kit.role_execute_pm_only`.
6. **Close** — check `done` → record `recognizes` in the turn episode → set `nav.next_actions` from `then` / `state_after`（`prop.memory.next_decay`）.

## Do not

- Restate procedure bodies (follow each factor `owner` path).
- Invent a brief when a package matches.
- Violate `prop.kit.no_subagent`（write/execute Subagent or Hermes MCP — forbidden）.

## Refs

- Index (GENERATED): `registry/packages/index.yaml`
- Human list (GENERATED): `docs/codenames.html`
- Factor ids: `registry/index.yaml`
