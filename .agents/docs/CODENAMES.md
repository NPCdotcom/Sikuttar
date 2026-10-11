# Codenames — full-form procedure packages

**Status**: canonical (kit) · **Factor dispatch**: `act.pm.codename_dispatch` · **Owner skill**: `skills/codename/`  
**Definitions (machine)**: `registry/packages/<id>.yaml` · **Human list (GENERATED)**: [`codenames.html`](./codenames.html)

A **codename** is a symbolic proper noun in a fixed full form. The human who shares the kit definitions types it; the Agent loads the registered brief and skips inventing one.

## Full form

```text
区分-固有名-番号
```

Regex (enforced by `generate-codenames`):

```text
^(手順|プロトコル|オペレーション)-[^\s\-]{2,8}-\d{1,2}$
```

| Part | Meaning |
|------|---------|
| 区分 | Gate weight: 手順 (procedure) · プロトコル (protocol) · オペレーション (operation) |
| 固有名 | Symbolic name — not a descriptive sentence. Shared recognition among people who share this kit |
| 番号 | Variant (environment / target). `-1` is the base form. Not a phase number |

Examples in this kit (names are provisional; rename by editing the package file and regenerating):

| Full form | id | Purpose (definition only) |
|-----------|-----|---------------------------|
| `手順-スタートアップ-1` | `proc-startup` | `.agents` already placed via copy-kit |
| `手順-スタートアップ-2` | `proc-startup` | From zero (folder + git-init) |

## Kind → gate

| Kind | Confirm before run | Notes |
|------|--------------------|-------|
| procedure | no (unless `confirm_points`) | Brief skip allowed |
| protocol | yes + options/recommended | Brief may skip invention; collaboration contract still applies |
| operation | yes | One-shot / non-reusable by default |

## Where truth lives

| Layer | Path | Edit |
|-------|------|------|
| Recognition (why / human dictionary) | this file · `docs/codenames.html` | HTML is GENERATED |
| Factors / package body | `registry/packages/` · `registry/clusters/` | Owner files |
| Expression (Cursor) | `skills/codename/SKILL.md` | Hand-written router (no procedure body) |

Do not restate factor `text` here — cite factor ids. Regenerate lists with:

```powershell
python env/bin/agents-run.py maintain-adhoc generate-codenames
```

## Invocation template

```text
手順-スタートアップ-2  PROJECT_NAME=<name>  PROJECT_PATH=<abs-path>
```

Missing required inputs → ask once (`on_missing: ask`). Do not guess.
