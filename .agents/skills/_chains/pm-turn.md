# L1 chain — PM turn (canonical)（`act.pm.turn_chain`）

**Tier**: L1 · **Language**: English · **Owner**: this file（他は id 参照のみ）  
**Why**: [`docs/PM_ROUTING.md`](../../docs/PM_ROUTING.md)  
**Only every-turn chain** — replaces memory-turn + secretary-turn.

```
pm-turn-start
→ [Loop2?] lifecycle-reference → secretary-brief (nav-brief)
→ role-execute
→ pm-turn-end
→ reply + short operational trace
```

**Codename**: if utterance matches full-form `区分-固有名-番号`, run **`act.pm.codename_dispatch`** and skip Loop1 brief invention（registered brief only）.  

**pm-turn-start** internals: context-guard → memory-reference → memory-reason(mini) → [`act.pm.codename_dispatch`?] → secretary-brief(turn) → secretary-route  

**pm-turn-end** internals: action-evaluate → [full] memory-critique → memory-flush → memory-record (nav REQUIRED) → [conditional] memory-refine  

**L1 writes**: nav.yaml + one episode + index touch（`prop.memory.nav_update_every_turn`）。  
**L2 writes**: traces/evaluations when full evaluate / turn_reward<0.6 / pre_compact.

**Canonical**: [PM_ROUTING.md](../../docs/PM_ROUTING.md) · [MEMORY_ARCHITECTURE.md](../../docs/MEMORY_ARCHITECTURE.md) · [CONTEXT_TIERS.md](../../docs/CONTEXT_TIERS.md)
