# TDD steps

- One **factor criterion** per Red cycle when possible (plan AC ↔ Factors table).
- No production change without a failing test for that change (unless user waives).
- Prefer testing factor contracts (inputs → effects / properties) over class hierarchies.
- Record Do log via implement-record after green — note which **factor** went green.
- If Red needs a new recognition kind → stop; that is design/plan work, not silent expansion.
