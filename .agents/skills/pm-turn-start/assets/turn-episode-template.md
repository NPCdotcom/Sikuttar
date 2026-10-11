---
id: episode-{YYYY-MM-DD}-{slug}
kind: episode
status: in_progress          # pm-turn-end sets done
turn_type: standard          # lightweight | standard | reanchor | pre_compact
---

# {slug} — {YYYY-MM-DD}

## Brief (pm-turn-start writes)

| Item | Value |
|------|-------|
| user_intent | |
| nav.next_actions (quoted) | |
| phase / H / gate (quoted) | |
| loop2 | skip \| done |
| context_loaded | docs/INDEX.yaml pick (≤1 L3) · skills (≤2) · learning/global ids |
| roles | Role → skills |
| decision_points | options A/B(/C) + recommended (or none) |

## Trace (pm-turn-end appends)

- tools / files touched:
- evaluate: full | mini | skip · turn_reward:
- writes: nav=yes · index=yes · L2 (traces/evaluations): yes | no
- chat_heavy: false
- gaps / skipped (llm-soft fallback):

## Done

- outcome (1–3 lines):
- next_actions → nav:
