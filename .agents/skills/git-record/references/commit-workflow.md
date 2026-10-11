# git-record — write workflow

## 0. Preconditions

- `git-reference` output exists this turn
- `docs/project-state.yaml` `git_policy` read (`enabled`, `auto_commit`, `auto_push`)
- No secrets-suspect paths in diff

## 1. Branch (P4 Go)

```
git checkout main
git checkout -b plan/<slug>
git tag plan/<slug>@agreed
```

Hotfix: `git checkout -b patch/<slug>` from current base.

## 2. Stage — scoped only

```
git add <plan-scope paths>       # never `git add -A` when unrelated dirty paths exist
git add .agents/plans/<plan>.md docs/...   # gate artifacts
```

Refuse: `.agents/memory/**`, `.cursor/**`, `.env*`, venv.

## 3. Commit

Write message to a temp file (UTF-8, no BOM) from `assets/commit-message-template.txt`, then:

```
git commit -F <tmpfile>
```

Type/scope per `GIT_WORKFLOW.md` §4.3. Footer `Plan:` always; `Criterion: AC-n` for P5; `Gate:` for gate commits.

## 4. Merge (P6 pass + user Go)

```
git checkout main
git merge --no-ff plan/<slug>
git tag plan/<slug>@done
git branch -d plan/<slug>        # after user confirms
```

## 5. GitHub (explicit request only)

```
gh auth status
gh repo create <name> --private --source . --remote origin --push     # first time
git push -u origin plan/<slug>
gh pr create --base main --head plan/<slug> --title "<type>(<slug>): <title>" --body-file <tmp from assets/pr-body-template.md>
```

Read PR comments: `gh api repos/<owner>/<repo>/pulls/<n>/comments` or `user-github` MCP.

## 6. Record

- Plan PDCA log: add row `| <date> | Do/Check | <note> | <sha> |`
- Gate commit → audit-log line: `- event: gate_commit · gate: <id> · sha: <sha> · enforcement: llm-soft`
- Episode: list commits made this turn

## 7. Failure

Hook rejected → fix → **new** commit (never amend). Conflict → stop, report paths, ask user.
