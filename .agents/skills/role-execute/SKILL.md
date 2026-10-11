---
name: role-execute
description: Run the role skill list from the turn brief in order inside this chat. Use after routing.
---

# Role Execute（`prop.kit.role_execute_pm_only`）

**Role**: **PM のみ** · turn-brief 割当表の実行（Owner: this skill · 他は id 参照のみ）

正本: `docs/PM_ROUTING.md` · Why: `docs/CURSOR_SUBAGENT_POLICY.md`

## Workflow

[`references/execution-workflow.md`](references/execution-workflow.md)

## Log template

[`assets/episodes/execution-log-template.md`](assets/episodes/execution-log-template.md)

Rules: `secretary-gate`, `kit-context-routing`, `no-subagents`, `cursor-tooling-pm`
