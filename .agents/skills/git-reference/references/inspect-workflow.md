# git-reference — inspect workflow

Run in project root (Shell). Read-only.

```
git rev-parse --is-inside-work-tree      # false → report NO_GIT · propose scripts/git-init
git branch --show-current
git status --short
git log -5 --oneline
git remote -v                             # empty → GitHub not connected (fine)
git diff --stat                           # when dirty
```

## Classify dirty paths

| Class | Rule | Action hint |
|-------|------|-------------|
| plan-scope | under paths listed in active plan Scope | candidate for `git-record` |
| unrelated | outside plan scope | ask user before any commit touching them |
| should-be-ignored | `.agents/memory/**`, `.cursor/*`, venv, `.env` | fix `.gitignore` via `git-record` |
| secrets suspect | `*.pem`, `*.key`, `.env*`, tokens in diff | **stop** · report |

## Gate gap check

Read `docs/project-state.yaml` `gate_status.last_decision` and plan `PDCA log` Commit column.  
If a passed gate has no matching commit → report `gate-commit missing: <gate id>`.

## Re-anchor mode

Only: branch · `status --short` · `log -3`. Compare branch name with `nav.active_plan` slug. Output one-line delta.

## Recommendation

| Condition | Recommend |
|-----------|-----------|
| clean, no gate gap | `none` |
| dirty plan-scope, criterion green | `gate-commit` |
| dirty, mid-criterion, risky next edit | `checkpoint` |
| plan just agreed, on `main` | `branch` |
| P6 pass, remote exists | `pr` |
