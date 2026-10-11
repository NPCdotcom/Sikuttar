---
name: git-record
description: Create gate-aligned commits, plan branches, tags, and GitHub pull requests with gh under the kit git safety rules. Use when the user asks to commit, push, branch, or open a PR, or when a plan criterion turns green and git_policy.auto_commit allows it.
---

# Git Record

**Role**: builder · hotfixer · reviewer · PM · Write  
**Canonical**: [`docs/GIT_WORKFLOW.md`](../../docs/GIT_WORKFLOW.md) · **Prerequisite**: `git-reference` this turn

## Workflow

[`references/commit-workflow.md`](references/commit-workflow.md)

## Templates

- Commit message: [`assets/commit-message-template.txt`](assets/commit-message-template.txt)
- PR body: [`assets/pr-body-template.md`](assets/pr-body-template.md)

## Gate

| Action | Requires |
|--------|----------|
| commit | user Go **or** `git_policy.auto_commit: criterion` + criterion green + tests pass |
| branch / tag | plan `status: agreed` (P4 Go) |
| push / `gh repo create` | explicit user request |
| merge / `gh pr merge` | P6 review pass + user Go |

## After

Append `Commit` sha to plan **PDCA log** row (via implement-record / patch-record / review-record) and one line to `.agents/memory/audit/audit-log.md` for gate commits.

## Do not

Force-push · amend pushed commits · `reset --hard` · `--no-verify` · touch `git config --global` · commit `.agents/memory/**` or secrets · commit unrelated dirty paths without asking.
