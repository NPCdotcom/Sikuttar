---
name: maintain-adhoc
description: Update kit skills, rules, or catalogs for process changes. Use when the agent kit itself needs an incremental fix.
---

# Maintain Ad hoc

**Role**: `kit_maintainer` · **Prerequisite**: `maintain-reference`.

## Tasks

[`references/typical-tasks.md`](references/typical-tasks.md)

## Audit / expressions

| Stem | 用途 |
|------|------|
| `audit-skill-layout` | skill フォルダ構造 · PM 必須 skill · 件数はスクリプト出力 |
| `generate-expressions` | `registry/` → design-* SKILL.md · `design-stewardship.mdc` |
| `generate-codenames` | `registry/packages/` → `packages/index.yaml` · `docs/codenames.html` |
| `check-expression-freshness` | GENERATED 面（expressions · codenames）の書き戻し / 未再生成を検出 |
| `check-factor-split` | `prop.kit.docs_do_not_restate_factors` · `prop.kit.factors_do_not_carry_rationale` |

```powershell
python env/bin/agents-run.py maintain-adhoc audit-skill-layout skills
python env/bin/agents-run.py maintain-adhoc generate-expressions
python env/bin/agents-run.py maintain-adhoc generate-codenames
python env/bin/agents-run.py maintain-adhoc check-expression-freshness
python env/bin/agents-run.py maintain-adhoc check-factor-split
```

互換: `python scripts/generate-expressions.py` · `python scripts/generate-codenames.py` · `python scripts/check-factor-split.py`

スクリプト資産の inventory/review: **`maintain-scripts`**

Apply via **maintain-record**.
