---
name: lib-tdd-cycle
description: Red-Green-Refactor TDD cycle for implementation work. Use when writing application code, fixing failing tests, or when the user asks for TDD or test-first changes.
---

# Library — TDD cycle

**Cross-cutting** · linked from implement-conduct

## Cycle

1. **Red** — write/adjust a failing test that expresses **one acceptance criterion / one factor**
2. **Green** — minimal code to pass (register or compose; do not invent a class tree for its own sake)
3. **Refactor** — clean without changing behavior

## Caps

Prefer minimal diff. Do not expand plan scope. Stop when criteria pass or plan needs split.  
Default unit = **factor** — [`docs/DESIGN_SEMANTICS.md`](../../docs/DESIGN_SEMANTICS.md).

Details: [`references/tdd-steps.md`](references/tdd-steps.md)
