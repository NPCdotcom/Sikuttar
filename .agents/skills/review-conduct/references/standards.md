# Generic review standards

Project-specific rules: **AGENTS.md** and **.agents/rules/local/**.  
Semantics: **docs/DESIGN_SEMANTICS.md**.

## Universal

- Public APIs typed and named clearly
- Errors handled at boundaries; no silent swallow
- No secrets in repo
- Comments explain why, not what
- Diff stays within stated scope

## Structure

- Separate presentation, domain logic, and infrastructure where applicable
- Avoid god objects and duplicated business rules
- Prefer factor registration / composition over new inheritance for extension

## Semantics (W3)

| Check | Fail / warn when |
|-------|------------------|
| Factor coverage | AC claims a factor but code has no corresponding unit / test |
| Recognition ≠ class | Spec “objects” implemented only as deep class trees without factor contracts |
| No class mandate | Reviewer must not require OOP class design when plan uses factors |
| Stack subordinate | Diff treats Rust/C++/… choice as philosophy core |

## Tests

- Flag missing tests for criteria marked testable in the plan
- Prefer one test focus per factor criterion

## External verification (WebSearch in P6)

- Security-, license-, or version-related claims in the diff → verify with WebSearch (official docs / advisories) before pass
- Deprecated API use suspected → confirm via docs, cite URL in the review

## Anti-patterns

| Pattern | Why flag |
|---------|----------|
| Spec behavior only in code | Drift; link `docs/design/` |
| Scope beyond plan | Needs plan_slicer |
| Hot path work without measurement note | Premature or risky optimization |
| Spec categories forced into inheritance | Recognition/factor confusion |
| Factors missing from Do of an H5 plan | Incomplete factorization |
