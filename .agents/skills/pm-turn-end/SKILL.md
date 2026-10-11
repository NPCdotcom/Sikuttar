---
name: pm-turn-end
description: End every agent turn—score the turn, append the trace to the turn episode file, flush chat into memory, update next_actions. Use before the final user reply after work finishes. Also after failed tools or when context pressure is high.
---

# PM turn end

**Role**: PM · **Chain**: [`_chains/pm-turn.md`](../_chains/pm-turn.md) · **IO contract**: [`../lib-memory-io/SKILL.md`](../lib-memory-io/SKILL.md)

## Steps

1. **action-evaluate** — full | mini | skip ([`../action-evaluate/SKILL.md`](../action-evaluate/SKILL.md))
2. **memory-critique** — only if full evaluate ([`../memory-critique/SKILL.md`](../memory-critique/SKILL.md))
3. **memory-flush** — L1 default; L2 if pre_compact / low reward ([`../memory-flush/SKILL.md`](../memory-flush/SKILL.md))
4. **memory-record** — apply `prop.memory.next_decay`（`agents-run memory-record apply-nav-decay`）then write nav（`prop.memory.nav_update_every_turn`）· append **Trace + Done** to the turn episode (`status: done`) · index touch ([`../memory-record/SKILL.md`](../memory-record/SKILL.md) · [`../memory-record/references/nav-decay.md`](../memory-record/references/nav-decay.md))
5. **learning / global promotion check** — new durable lesson or preference? → memory-reason proposal → global/learning path (never leave it only in chat)
6. **memory-refine** — conditional only

## L1 required writes

| Path | Required |
|------|----------|
| `.agents/memory/state/nav.yaml` | yes（`prop.memory.nav_update_every_turn` · `prop.memory.next_decay`）— `updated`, decayed `next_actions`, pressure clear if done |
| `.agents/memory/episodes/YYYY-MM-DD-*.md` | yes — same file pm-turn-start opened; Trace + Done sections |
| `.agents/memory/index.yaml` | touch `updated` (+ entry for new episode) |

## Chat output

≤3 lines + decision request. Operational trace lives in the episode (`chat_heavy: true` if the reply had to exceed ~30 lines without a file write).

## Do not

Skip `prop.memory.nav_update_every_turn` on standard turns. Write traces/evaluations on every turn (L2 only). Paste the trace template into chat.

**Canonical**: `docs/PM_ROUTING.md` · `docs/MEMORY_ARCHITECTURE.md` · `docs/COLLABORATION_CONTRACT.md` §4
