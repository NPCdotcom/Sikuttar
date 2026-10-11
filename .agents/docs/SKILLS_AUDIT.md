# Skills audit (meta)

**Updated**: 2026-09-17 (Git context)

| Item | Value |
|------|-------|
| Skill count | **56** (48 base + pm-turn-start/end + 4 lib-* + git-reference/record) |
| L1 chain | `_chains/pm-turn` only |
| Loop canonical | `docs/PM_ROUTING.md` |
| Role×Skill canonical | `skills/role-skill-catalog/references/full-catalog.md` |

Spec: [agentskills.io/specification](https://agentskills.io/specification) · Tiers: [CONTEXT_TIERS.md](./CONTEXT_TIERS.md)

## PM turn (every turn)

| Skill | Notes | Enforcement |
|-------|-------|-------------|
| `pm-turn-start` | Orchestrates guard → recall → brief → route | llm-soft |
| `role-execute` | Role skill column | llm-soft |
| `pm-turn-end` | evaluate → flush → record | llm-soft |
| Hooks preCompact/stop | pressure + audit-log | **hook** |

## Libraries (cross-cutting)

| Skill | Used by |
|-------|---------|
| `lib-doc-frontmatter` | design-record · plan-record · doc-record |
| `lib-tdd-cycle` | implement-conduct |
| `lib-review-vmodel` | review-conduct |
| `lib-memory-io` | pm-turn-end · memory-flush · memory-record |

## Git (cross-cutting)

| Skill | Notes | Enforcement |
|-------|-------|-------------|
| `git-reference` | status/diff/log → recommendation | llm-soft |
| `git-record` | gate commits · plan branches · gh PR | llm-soft (user-gated) |
| `scripts/git-init` + templates | repo init · ignore/attributes | **script** |

## Audit commands

```bash
python env/bin/agents-run.py maintain-adhoc audit-skill-layout skills
python env/bin/agents-run.py maintain-scripts inventory skills
python env/bin/agents-run.py maintain-scripts review
```

## Deprecated (deleted)

| Old | Replacement |
|-----|-------------|
| `_chains/memory-turn` · `secretary-turn` | `_chains/pm-turn` |
| `docs/SKILLS_RULES_BY_PHASE.md` | full-catalog |
| `rules/cursor-agent-tooling.mdc` | cursor-tooling-pm / stewards |
