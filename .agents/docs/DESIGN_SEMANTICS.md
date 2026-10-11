# Design semantics — recognition vs factors

**Status**: canonical (kit) · **Wave**: W1–W4 (NPCdotcom E-15 / E-17)  
**Related**: global `npcdotcom-philosophy` · [COLLABORATION_CONTRACT.md](./COLLABORATION_CONTRACT.md) · [PROJECT_LIFECYCLE.md](./PROJECT_LIFECYCLE.md) · [LANGUAGE_POLICY.md](./LANGUAGE_POLICY.md)

This document is the kit-side **misreading guard**. Consumer domain language stays in root `AGENTS.md` / `rules/local/`.

---

## 1. Hierarchy (do not collapse)

```text
Object (recognition / naming / spec)
  = unit that *encompasses* influence on the world
  ≠ mandatory code class / inheritance hierarchy
       │ encompasses
       ▼
Function · Action · Property  (factors)
  = minimal constitutive units of influence / change
  = functional minimum of an object
       │ subordinate means
       ▼
Execution stack (e.g. Rust, C++/CUDA/Vulkan) — optional / preferred, not philosophy core
```

| Layer | Put in | Do not put |
|-------|--------|------------|
| **Recognition (object)** | design / requirements / glossary / ADR / registry *kinds* | Forced class trees as the only design output |
| **Factors** | H5 / algorithms / kernels / plan Do units / TDD subjects | Treating “object” as the only implementable unit |
| **Stack** | preferences · landscape · consumer AGENTS | Kit philosophy *must* clauses |

---

## 2. Agent defaults

1. Propose **factor registration / combination** first (registry + OCP style), not a class hierarchy.
2. Use “object” for **recognition / classification / spec**, not as synonym of `class`.
3. Message / event-driven designs are fine. **Class-centric OOP is not mandatory.**
4. GoF / inheritance / composition are **references / options**, never hard requirements.
5. Recall global `npcdotcom-philosophy` when present (`every_turn` for this owner).

---

## 3. Misalignment signs (stop and realign)

| Sign | Fix |
|------|-----|
| Spec categories forced into class inheritance | Split recognition vs factors; register factors |
| Design only names objects, never factors | Add function / action / property decomposition |
| “Action layer = runtime/execution only” | Factors are constitutive units; stack is subordinate |
| Stack (Rust/C++/…) treated as philosophy core | Demote to means; keep empty×extensible core |
| Image / terms not shared, but Do proceeds | Align vocabulary before implement |

Matches collaboration C4-style drift: philosophy breach · skipped steps · term mismatch · **recognition/factor confusion**.

---

## 4. North star (short)

**Empty core × infinite extension via registration** → approximate reality.  
Beauty = unify **factors** (and encompassing recognition) under registry; specialize via registration content.

Detail: `~/.agents/memory/global/knowledge/philosophy/npcdotcom-philosophy.md`

---

## 5. Design factor canonical home

Design 工程（C6a · `spec_designer`）の**因子正本**は [`registry/clusters/design.yaml`](../registry/clusters/design.yaml)。認識のガードは本ドキュメント。発現面は `agents-run maintain-adhoc generate-expressions` が `skills/design-*/SKILL.md` と `rules/design-stewardship.mdc` を生成する（書き戻し禁止）。

切り分けの 2 禁止: `prop.kit.docs_do_not_restate_factors` · `prop.kit.factors_do_not_carry_rationale`（検査: `agents-run maintain-adhoc check-factor-split`）。

---

## 6. Artifact map (W2–W4)

| Artifact | Path |
|----------|------|
| Deliberation | `docs/design/_deliberation-template.md` |
| Element / System / Program design | `docs/design/{elements,systems,programs}/_design-template.md` |
| Plan (H4/H5) | `.agents/plans/_template.md` |
| H5 folder guide | `.agents/plans/algorithms/README.md` |
| Glossary seed | `docs/glossary/README.md` |
| doc-record design/glossary | `skills/doc-record/assets/templates/` |
| Implement / TDD / Review / Patch (W3) | `implement-conduct` · `lib-tdd-cycle` · `review-conduct` · `patch-conduct` · RTM Factor 列 |
| Landscape / Terminology (W4) | `LANDSCAPE_RESEARCH_POLICY` · `TERMINOLOGY_RESEARCH_POLICY` · scan/alignment テンプレ |
