# Git workflow — local Git per project · GitHub optional

**Canonical** for all Git/GitHub behavior in kit consumer projects.  
Related: [PROJECT_LIFECYCLE.md](./PROJECT_LIFECYCLE.md) · [PM_ROUTING.md](./PM_ROUTING.md) · [MEMORY_ARCHITECTURE.md](./MEMORY_ARCHITECTURE.md) · [CURSOR_AGENT_TOOLING.md](./CURSOR_AGENT_TOOLING.md) §12  
Rule: `rules/git-stewardship.mdc` · Skills: `git-reference` · `git-record` · Bootstrap: `scripts/git-init.ps1|sh`

---

## 1. Principles

| Principle | Meaning |
|-----------|---------|
| **Local Git is mandatory** | Every consumer project is a Git repo from bootstrap. GitHub remote is optional. |
| **Git = second control plane** | `git status` / `git log` are file truth like `nav.yaml`. Re-anchor reads both. |
| **Gate-aligned commits** | Commits land on phase gates and green acceptance criteria — not on arbitrary chat turns. |
| **Agent proposes, user decides** | Commit/push/merge are user-gated unless `git_policy.auto_commit` pre-authorizes (see §4). |
| **Memory never committed** | `.agents/memory/**`, `nav.yaml`, venv, junctions stay local (`.gitignore` template). |

Enforcement: `.gitignore` / `.gitattributes` / `git-init` script = **script**. Commit timing = **llm-soft** (fallback: `git-reference` reports uncommitted gate work as a gap in the episode).

---

## 2. Repository layout (consumer)

```
project/
├── .git/
├── .gitignore            # from scripts/templates/gitignore.consumer (+ stack lines)
├── .gitattributes        # from scripts/templates/gitattributes.consumer
├── .gitmessage           # commit template (git config commit.template)
├── AGENTS.md             # committed
├── docs/                 # committed (team canonical)
├── .agents/
│   ├── plans/            # committed
│   ├── skills/ rules/    # committed (kit copy)
│   └── memory/           # NOT committed
└── .cursor/              # junctions — NOT committed
```

---

## 3. Branch model

| Branch | Purpose | Created by | Merged when |
|--------|---------|------------|-------------|
| `main` | Agreed, reviewed state | `git-init` | — |
| `plan/<plan-slug>` | One agreed plan's P5 Do | `git-record` at P4 Go | P6 review **pass** + user Go |
| `patch/<slug>` | hotfixer small fix | `git-record` | reviewer or user Go |
| `spike/<slug>` | S0 discovery (P0–P3) | user request | usually **not** merged; notes go to docs |

Rules: no direct Do commits on `main` when a plan branch exists · one plan = one branch · delete branch after merge (user confirms).

---

## 4. Commit policy

### 4.1 `git_policy` in `docs/project-state.yaml`

```yaml
git_policy:
  enabled: true
  default_branch: main
  auto_commit: ask        # ask | criterion | off
  auto_push: false        # push always requires explicit user request
  remote: ""              # e.g. github.com/<owner>/<repo>
```

| `auto_commit` | Agent behavior |
|---------------|----------------|
| `ask` (default) | Propose a commit at each gate / green criterion; wait for user Go |
| `criterion` | Commit automatically on a plan branch when one acceptance criterion turns green and tests pass; still ask for merge/push |
| `off` | Never commit; only report via `git-reference` |

### 4.2 Gate ↔ Git mapping

| Event | Branch | Commit type | Extra |
|-------|--------|-------------|-------|
| Bootstrap done | `main` | `chore: bootstrap agent kit` | initial commit |
| P0–P3 `*-record` | `main` | `design(<slug>): …` / `docs(<slug>): …` | |
| P4 plan `agreed` (user Go) | `main` → create `plan/<slug>` | `plan(<slug>): agree <title>` | tag `plan/<slug>@agreed` |
| P5 criterion green | `plan/<slug>` | `feat|fix|test|refactor(<slug>): AC-n …` | footer `Criterion: AC-n` |
| P5+ hotfix | `patch/<slug>` | `fix(<slug>): …` | |
| P6 review pass + Go | merge into `main` | `merge: plan/<slug>` (no-ff) | tag `plan/<slug>@done` |
| Recycle / Hold | keep branch | `wip(<slug>): hold — <reason>` | note in plan PDCA log |
| Kill | keep or delete (user) | — | plan `status: superseded` |

### 4.3 Commit message format

```
<type>(<scope>): <summary ≤ 72 chars>

<why — 1–3 lines>

Plan: .agents/plans/<path>.md
Criterion: AC-n            # P5 only
Gate: P4-plan-<slug>-go    # gate commits only
```

Types: `feat` `fix` `test` `refactor` `docs` `design` `plan` `chore` `wip` `merge`. Scope = plan slug or `kit`.

### 4.4 Never

- `git push --force` to `main` · `git commit --amend` on pushed commits · `git rebase -i` · editing `git config --global`
- Committing `.agents/memory/**`, secrets, `.env`, credentials, large binaries not in `.gitattributes` LFS list
- Skipping hooks (`--no-verify`) unless the user explicitly asks
- Committing while `gate_status.current = block` or plan `status != agreed` for P5 work

---

## 5. Checkpoint rule (agent safety)

Before a risky agent edit batch (multi-file refactor, generated code, migration):

1. `git-reference`: confirm clean or intentionally dirty tree
2. If dirty and unrelated → ask user (do not stash silently)
3. Commit a `wip(<slug>):` checkpoint on the plan branch when `auto_commit != off` and user has given Go for the Do cycle

Rollback = `git checkout -- <paths>` / `git revert <sha>` — never `reset --hard` without explicit user request.

---

## 6. Re-anchor with Git

On Re-anchor / pre_compact turns, `pm-turn-start` adds:

```
git status --short
git log -5 --oneline
git branch --show-current
```

Compare with `nav.active_plan` and `project-state.active_pdca`. Mismatch → report one-line delta before any edit.

---

## 7. GitHub (optional)

| Task | Tool | Gate |
|------|------|------|
| Auth check | `gh auth status` | — |
| Create private repo + push | `gh repo create <name> --private --source . --remote origin --push` | **user request** |
| Push branch | `git push -u origin <branch>` | **user request** |
| Open PR | `gh pr create --base main --head plan/<slug>` body from [PR template](#71-pr-body-template) | after P6 review pass |
| Read PR / issues | `user-github` MCP namespace or `gh pr view` | read-only anytime |
| Merge PR | `gh pr merge --merge` | **user Go** (Gate Keeper) |

Actions/CI are not required by the kit. If present, keep `.github/workflows/` project-owned; do not confuse with Cursor Automations.

### 7.1 PR body template

```markdown
## Plan
.agents/plans/<path>.md — <title>

## Acceptance criteria
- [x] AC-1 …
- [x] AC-2 …

## Review
docs/reviews/<file>.md — verdict: pass | conditional

## Notes
Facts / Assumptions / Open (link, do not duplicate)
```

---

## 8. Windows notes

- `.gitattributes` enforces `* text=auto eol=lf`; do not rely on `core.autocrlf` per machine
- Junctions under `.cursor/` are ignored; never `git add .cursor`
- PowerShell: pass commit messages via `-F` file or here-string to avoid quoting/encoding loss (UTF-8 without BOM)

---

## 9. Bootstrap

```powershell
.\.agents\scripts\git-init.ps1            # init main · .gitignore · .gitattributes · .gitmessage · first commit
.\.agents\scripts\git-init.ps1 -Remote github.com/<owner>/<repo>   # + gh repo create (asks)
```

```bash
./.agents/scripts/git-init.sh [--remote github.com/<owner>/<repo>]
```

`maintain-bootstrap` §1b runs this. Verify: `git rev-parse --is-inside-work-tree` → `true`, `git log --oneline | wc -l` ≥ 1.
