# Generic implementation standards

Stack-specific: **AGENTS.md** and **rules/local/**.  
Semantics: **docs/DESIGN_SEMANTICS.md** (recognition vs factors).

## Scope

- Smallest change that satisfies **one factor criterion**
- One logical concern per commit-sized batch
- Prefer register / compose factors over new inheritance trees

## Quality

- Readable names; English identifiers unless AGENTS.md says otherwise
- Fail loudly at boundaries; avoid silent nil access
- Reuse project utilities before adding parallel helpers

## Architecture

- Separate decision logic from bulk computation where the project already does
- State changes only at documented simulation boundaries
- **Object** in design = recognition/spec — do not force it into a class hierarchy unless the consumer project requires it

## External knowledge (WebSearch in P5)

- Unknown or version-sensitive API / library / framework behavior → **WebSearch official docs first** (≥1 source), browser MCP for the exact page if needed; do not code from training memory alone
- Record the URL in the plan Do log (`implement-record`) so the reviewer can re-check
- Error messages you cannot explain → WebSearch the message before guessing

## Verification

- State how to verify each acceptance criterion（editor steps, test command, or manual scenario）
- Name the **factor** under test in the verification note

## Anti-patterns

| Pattern | Avoid |
|---------|--------|
| Implementing undiscussed rules | Spec gap |
| Large refactor while adding feature | Out of plan Scope |
| Copy-paste plan text into comments | Link paths instead |
| Spec categories → forced class tree | Recognition/factor confusion |
| One Do cycle spanning many unrelated factors | Split plan / AC |
