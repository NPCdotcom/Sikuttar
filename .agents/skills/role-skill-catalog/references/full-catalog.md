# Role & skill catalog — detailed table

## Every turn (PM)

| Timing | Skill |
|--------|-------|
| Start | **pm-turn-start** |
| Codename (conditional) | **codename**（`act.pm.codename_dispatch` · full-form match） |
| Loop2 (conditional) | lifecycle-reference → nav-brief |
| Execute | **role-execute** |
| End | **pm-turn-end** |

Canonical chain: `skills/_chains/pm-turn.md`

## Libraries (cross-cutting)

| Lib | Used by |
|-----|---------|
| `lib-doc-frontmatter` | design-record · plan-record · doc-record |
| `lib-tdd-cycle` | implement-conduct |
| `lib-review-vmodel` | review-conduct |
| `lib-memory-io` | pm-turn-end · memory-flush · memory-record |

## Git (cross-cutting · `docs/GIT_WORKFLOW.md`)

| Skill | Used by | Gate |
|-------|---------|------|
| `git-reference` | builder · hotfixer · reviewer · PM (re-anchor) | read-only |
| `git-record` | builder (criterion commit) · hotfixer (`patch/*`) · reviewer (merge/PR after pass) · kit_maintainer (bootstrap) | user Go or `git_policy.auto_commit: criterion` |

## Role → primary skills (Cursor IDE)

| Role | Primary skills (order) |
|------|------------------------|
| `router` | pm-turn-start internals · adaptive-lifecycle-plan · brownfield-reference · lifecycle-reference · landscape-research · terminology-research · cursor-tool-select |
| `spec_designer` | brownfield-reference · landscape-research · terminology-research · design-reference · design-deliberate · design-record · doc-record · lib-doc-frontmatter（factors: `registry/clusters/design.yaml`） |
| `plan_slicer` | terminology-research · plan-reference · plan-record · design-reference · lib-doc-frontmatter |
| `builder` | implement-reference · implement-conduct · lib-tdd-cycle · implement-record · git-reference · git-record · plan-reference · design-reference |
| `hotfixer` | patch-reference · patch-conduct · patch-record · git-record · plan-reference |
| `reviewer` | review-reference · git-reference · review-conduct · lib-review-vmodel · review-record · git-record · lifecycle-reference |
| `evaluator` | evaluate-reference · plan-evaluate · project-evaluate · evaluate-record |
| `automator` | automation-reference · automation-run · automation-record · plan-reference |
| `kit_maintainer` | landscape-research · maintain-reference · maintain-scripts · maintain-adhoc · maintain-record · role-skill-catalog |

PM: `prop.kit.role_execute_pm_only` after turn start（`act.pm.turn_chain`）。

## Phase → Role → skills

| P | Role | Skills |
|---|------|--------|
| Every | PM / router | `act.pm.turn_chain` |
| P0–P3 | `spec_designer` | terminology-research → design-* · lib-doc-frontmatter |
| P4 | `plan_slicer` | terminology-research → plan-* · lib-doc-frontmatter |
| P5 | `builder` | implement-* · lib-tdd-cycle |
| P5+ | `hotfixer` | patch-* |
| P6 | `reviewer` / `evaluator` | review-* · lib-review-vmodel · evaluate-* |
| Kit | `kit_maintainer` | maintain-* |

## Phase → Rules (pointers only — no duplicate tables in rules)

| P | Rules |
|---|-------|
| Every | secretary-gate · no-subagents · kit-context-routing |
| P0–P3 | design-stewardship · docs-content · documentation-adr-glossary · project-lifecycle |
| P4 | planning · plans-content · project-lifecycle |
| P5 | implementation-stewardship · patch-stewardship · rules/local/*-implement |
| P6 | review-stewardship · evaluation-stewardship · rules/local/*-review |
| Cross | role-cross-skills · cursor-tooling-pm · cursor-tooling-stewards · git-stewardship |
| Kit | maintenance-stewardship |
| Automation | automation-stewardship |

## Write boundaries

| Path | Writer |
|------|--------|
| `.agents/memory/**` | pm-turn-end / memory-record / memory-flush |
| `docs/requirements/` · `docs/design/` · `docs/adr/` · `docs/glossary/` | spec_designer |
| `docs/project-state.yaml` | PM（`prop.state.gate_write_pm_confirm`） |
| `.agents/plans/` | plan_slicer |
| Application source | builder · hotfixer |
| `docs/reviews/` | reviewer |
| `docs/evaluations/` | evaluator |
| `.agents/rules/` · `.agents/skills/` | kit_maintainer |
| Git history (commit · branch · tag · PR) | git-record only (user-gated per `git_policy`) |

## Removed

See [`deprecated-aliases.md`](deprecated-aliases.md)
