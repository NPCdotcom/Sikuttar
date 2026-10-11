# Implement reference — workflow

1. **`lifecycle-reference`** + **`plan-reference`** — plan under `programs/` or `algorithms/`; `pdca_eligible: true`; upper H links present
2. **`plan-reference`** — Scope, Out of scope, Acceptance criteria, **Factors**, status
3. **`design-reference`** — `related_design`, Facts, Assumptions, Recognition vs Factors
4. **Source layout** — paths per **AGENTS.md**（e.g. `scripts/`, `scenes/`）
5. **Existing code** — read files likely to change; note patterns
6. **Readiness** — wrong scope_level, phase, criteria >5 without split, or AC not mappable to factors on H5 → stop / recommend split

Do not write code yet. Do not expand scope beyond plan.  
Default Do unit = **factor** — [`docs/DESIGN_SEMANTICS.md`](../../../docs/DESIGN_SEMANTICS.md).
