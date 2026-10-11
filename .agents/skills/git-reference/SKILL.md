---
name: git-reference
description: Inspect git status, diff, log, branch, and remote to decide whether a checkpoint commit, branch, or PR is needed. Use before committing, at review start, when re-anchoring after a long session, or when the user asks what changed.
---

# Git Reference

**Role**: cross-cutting (builder · hotfixer · reviewer · PM) · Read-only  
**Canonical**: [`docs/GIT_WORKFLOW.md`](../../docs/GIT_WORKFLOW.md)

## Gather

[`references/inspect-workflow.md`](references/inspect-workflow.md)

## Output

One block in the turn: current branch · dirty paths (grouped: plan-scope / unrelated / ignored-should-be) · last 5 commits · gate ↔ commit gap · recommendation (`none` | `checkpoint` | `gate-commit` | `branch` | `pr`).

## Do not

Run any write command (`add`, `commit`, `checkout -b`, `push`, `stash`). Hand off to **git-record**.
