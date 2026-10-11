# Operational trace

**Lives in the turn episode** (`skills/pm-turn-start/assets/turn-episode-template.md` §Trace). Chat gets **one line** only:

```
trace: <loop> · nav=updated · evaluate=<mode> · episode=<path>
```

## Fields (episode)

- loop: standard | lightweight | reanchor | pre_compact
- context-guard: pressure | loop2 | reanchor | pre_compact_recommended
- context_loaded: INDEX.yaml pick · skills · learning/global ids
- nav: read/updated | next_actions
- Loop2: done/skip | nav-brief: done/skip
- recall / flush level
- evaluate: full/mini/skip | critique: full/skip
- roles executed
- writes: nav · episode · index · L2
- chat_heavy: true/false
- PM self-execution: none

Canonical: `docs/MANDATORY_PROCEDURES.md` · `docs/PM_ROUTING.md` · `docs/COLLABORATION_CONTRACT.md` §4
