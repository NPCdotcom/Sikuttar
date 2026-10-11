---
name: memory-record
description: Update nav.yaml, write an episode, and touch the memory index. Use at turn end after flush; also when repairing missing memory files.
---

# Memory Record

**Tier**: L1 · **Chain**: [`_chains/pm-turn.md`](../_chains/pm-turn.md) · **IO**: [`../lib-memory-io/SKILL.md`](../lib-memory-io/SKILL.md)

`prop.memory.nav_update_every_turn`（except lightweight minimal）。  
`prop.memory.next_decay` — apply before writing `next_actions`（[`references/nav-decay.md`](references/nav-decay.md)）。

```powershell
python env/bin/agents-run.py memory-record apply-nav-decay -- --nav .agents/memory/state/nav.yaml --proposed proposed.yaml --turn N --phase Px --gate STATUS
```

Scope: [`references/write-scope.md`](references/write-scope.md) · audit: [`references/audit-view.md`](references/audit-view.md)

Templates: [`assets/index/entry-append.yaml`](assets/index/entry-append.yaml) · [`assets/episodes/episode-write-template.md`](assets/episodes/episode-write-template.md)

Canonical: [MEMORY_ARCHITECTURE.md](../../docs/MEMORY_ARCHITECTURE.md)
