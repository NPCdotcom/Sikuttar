# Factor / docs split checks

Owner for:

- `prop.kit.docs_do_not_restate_factors`
- `prop.kit.factors_do_not_carry_rationale`

Rule bodies live in `registry/kit.yaml`. This file is the procedure only.

## Run

```powershell
python env/bin/agents-run.py maintain-adhoc check-factor-split
```

互換: `python scripts/check-factor-split.py`

## Scope

| Check | Target |
|-------|--------|
| A rationale | `registry/**/*.yaml` factor records |
| B restatement | kit `docs/**/*.md` vs factor `text`（len ≥ 40） |

Not scanned: `learning/` · `memory/` · GENERATED expression surfaces.

## On failure

Fix registry `why` to a `docs/…` path, remove banned keys, or replace docs restatement with an id reference. Re-run until exit 0.
