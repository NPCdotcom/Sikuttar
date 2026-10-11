---
name: pm-turn-start
description: Start every agent turn—read nav memory, detect context pressure, pick the one doc and learning entries the turn needs, draft a short turn plan and roles. Use at the beginning of user messages, before coding or editing. Also when resuming after summarize or when unsure what to do next.
---

# PM turn start

**Role**: PM · **Chain**: [`_chains/pm-turn.md`](../_chains/pm-turn.md)

## Steps (in order — do not skip unless lightweight)

1. **context-guard** — pressure · Loop2 · reanchor · pre_compact ([`../context-guard/SKILL.md`](../context-guard/SKILL.md))
2. **memory-reference** — nav Phase 0 · bootstrap ERROR if missing · **tag-match** global index + `learning/index.yaml` ([`../memory-reference/SKILL.md`](../memory-reference/SKILL.md))
3. **context select** — extract 1–3 intent tags → pick **≤1** L3 doc from [`docs/INDEX.yaml`](../../docs/INDEX.yaml); never load all docs
4. **memory-reason** — mini (Loop1) or full (Loop2) ([`../memory-reason/SKILL.md`](../memory-reason/SKILL.md))
5. **`act.pm.codename_dispatch`?** — if utterance has full-form `区分-固有名-番号`, run [`../codename/SKILL.md`](../codename/SKILL.md) and use the registered brief（skip inventing a brief）
6. **secretary-brief** — turn-brief **written to the turn episode file**, not chat ([`assets/turn-episode-template.md`](assets/turn-episode-template.md)); Loop2 → nav-brief first; skip invention when step 5 matched
7. **secretary-route** — Role rows ([`../secretary-route/SKILL.md`](../secretary-route/SKILL.md)); when step 5 matched, roles come from the package `brief`

Decision point detected → apply [`docs/COLLABORATION_CONTRACT.md`](../../docs/COLLABORATION_CONTRACT.md) §2 (options + recommended).

## Output to chat

≤3 lines: intent · roles · decision request (if any). Everything else is in `.agents/memory/episodes/YYYY-MM-DD-<slug>.md`.

## Lightweight

Greeting-only: steps 1–2 minimal · one-line brief · skip route Role 0 · skip pm-turn-end evaluate.

## Do not

Run `*-conduct` / Edit before this skill completes (except Re-anchor stop). Paste the full brief into chat. Load more than one L3 doc.

**Canonical**: `docs/PM_ROUTING.md` · `docs/CONTEXT_TIERS.md`
