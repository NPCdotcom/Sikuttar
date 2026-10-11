# Cursor Automation Instruction (Generic)

## Purpose

Run only the cycle from **agreed plan** to **completion of that agreed plan**.
Automation must not execute from drafts or chat-only intent.

## Execution Boundary

- Allowed inputs:
  - `.agents/plans/programs/` or `algorithms/` plan with `status: agreed`, `pdca_eligible: true`, `scope_level: program|algorithm`
  - Linked design via `related_design` that is sufficiently detailed
  - Explicit acceptance criteria in the plan
- Disallowed inputs:
  - `status: draft` plans
  - Draft-only design without accepted planning context
  - Unapproved scope additions from comments/chat

## Hard Gates (all required)

1. Target plan exists and `status == agreed`
2. Plan has testable acceptance criteria
3. Scope / Out-of-scope is explicit
4. Next action is mapped to a Cursor role + skill sequence
5. Plan Scope hierarchy — upper H paths filled or explicitly waived by approval channel
6. Automation instruction references `plan_path`, optional `lifecycle_phase=P5`, `scope_level`

If any gate fails: stop and request human/PM confirmation.

## Cursor Role Routing in Automation

- Design refinement or unresolved requirements -> `spec_designer`
- Plan creation/update/approval workflow -> `plan_slicer`
- Do (planned implementation) -> `builder`
- Small post-Do fix/regression -> `hotfixer`
- Check/review -> `reviewer`
- Progress/health checkpoints -> `evaluator`
- Kit/rule/skill updates -> `kit_maintainer`

PM must pass through `router` first（`prop.kit.role_execute_pm_only` · `prop.kit.no_subagent`）。

## Automation Loop

1. Router brief and route
2. Validate agreed-plan gates
3. Execute Cursor role work via `prop.kit.role_execute_pm_only`
4. Record output (criteria mapping, blockers)
5. Run check/evaluation as needed
6. Close agreed plan cycle or return to design/plan phase by human decision

## Safety Rules

- Never widen scope automatically.
- Never execute `implement-conduct` unless the plan is agreed.
- Never merge "designing what to do" and "doing" in one opaque step.
- Prefer stop-with-reason over speculative action.

## Required Run Metadata

- `plan_path`
- `plan_status`
- `related_design_path`
- `steward`
- `skills_used`
- `criteria_touched`
- `result` (`done` / `blocked` / `needs_approval`)
