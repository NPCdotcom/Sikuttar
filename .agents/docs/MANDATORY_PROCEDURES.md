# Mandatory procedures — index

**Canonical loop**: [PM_ROUTING.md](./PM_ROUTING.md)  
**Tiers**: [CONTEXT_TIERS.md](./CONTEXT_TIERS.md) · **Gate**: `rules/secretary-gate.mdc`

Priority: `secretary-gate` → `PM_ROUTING` → this index → `MEMORY_ARCHITECTURE` → `AGENT_EVALUATION`

---

## Enforcement

| Procedure | Enforcement | Fallback if skipped |
|-----------|-------------|---------------------|
| preCompact pressure | **hook** | — |
| nav Phase 0 read | **llm-soft** | ERROR + repair from example |
| L1 episode + nav update | **llm-soft** | next turn notes gap; do not invent state |
| Role×Skill table | catalog only | — |

---

## Control plane (required)

| File | Every turn |
|------|------------|
| `.agents/memory/state/nav.yaml` | Phase 0 · terminal（`prop.memory.nav_update_every_turn` · `prop.memory.nav_missing_is_error`） |
| `.agents/memory/episodes/` | L1 write (non-lightweight) |
| `docs/project-state.yaml` | Loop2 · Phase C（`prop.state.loop1_quote_loop2_sync`） |

---

## Turn type → procedure

| Type | Condition | Procedure |
|------|-----------|-----------|
| **Standard** | Default | `act.pm.turn_chain` |
| **Lightweight** | Greeting only · Role 0 · no record | minimal start · skip end evaluate · L0/nav touch |
| **Re-anchor** | mismatch · compact | PM_ROUTING § re-anchor |
| **pre_compact** | pressure=pre_compact | L2 required · new chat |

**Loop2**: if unclear → **run**.

---

## L1 chain (standard)

Owner: **`act.pm.turn_chain`** — [skills/_chains/pm-turn.md](../skills/_chains/pm-turn.md)（手順の再掲はしない）

---

## Evaluate matrix

| Turn | evaluate | critique |
|------|----------|----------|
| Lightweight | skip | skip |
| Loop1 read-only | mini | skip |
| Loop1 execute / Loop2 | full | full (if full evaluate) |

---

## Always forbidden

memory without index · conduct while gate=block · P/H re-inference in Loop1 · soft-skip missing nav/episodes

---

## Catalog

[skills/role-skill-catalog/references/full-catalog.md](../skills/role-skill-catalog/references/full-catalog.md)
