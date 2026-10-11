# nav.next_actions decay — `prop.memory.next_decay`

Owner for `prop.memory.next_decay`. Rule body lives in the registry; this file is the procedure.

## When

Every standard `pm-turn-end` → before / as part of writing `.agents/memory/state/nav.yaml`（`prop.memory.nav_update_every_turn`）.

## Shape

```yaml
navigation:
  next_actions:          # ≤3
    - text: "…"
      asserted_at_turn: 12
      phase_bound: false
```

Legacy string items are normalized on first apply to `{ text, asserted_at_turn: current_turn, phase_bound: false }`.

## Apply (deterministic)

```powershell
python env/bin/agents-run.py memory-record apply-nav-decay --nav .agents/memory/state/nav.yaml --proposed path/to/proposed-next.yaml --turn N --phase P3 --gate passed
```

`--dry-run` prints the resulting `next_actions` without writing.

`proposed-next.yaml` example:

```yaml
next_actions:
  - text: "Continue design-record"
    phase_bound: false
  - text: "Run terminology-research"
    phase_bound: true
```

Bare strings in `proposed` are also accepted.

## Steps the script performs

1. Normalize existing + proposed items
2. Re-assert: proposed `text` (normalized) → `asserted_at_turn = turn`
3. Drop items with `turn - asserted_at_turn >= 3` that were not re-asserted
4. If phase or gate **advanced** vs previous nav → drop all `phase_bound: true`
5. Cap at ≤3; write `navigation.next_actions` only（other nav fields untouched unless `--sync-alignment`）

## Do not

- Decay or rewrite `episodes/**`（append-only logs）
- Invent next_actions when nav is missing（`prop.memory.nav_missing_is_error`）
