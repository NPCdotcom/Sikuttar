# Collaboration contract — user vs agent

**Canonical** for task split. Related: [ROLES_AND_GOVERNANCE.md](./ROLES_AND_GOVERNANCE.md) (gate detail) · [PM_ROUTING.md](./PM_ROUTING.md)

## 1. Who does what

| User (steering) | Agent (all work) |
|-----------------|------------------|
| Ideas · intent · priorities | Research (WebSearch/browser) · options · recommendation |
| **Decisions**: Go / Conditional / Recycle / Hold / Kill | Drafting docs, plans, code, tests, reviews |
| Commands ("do X", "commit", "push") | Execution via roles · verification · records |
| `>` scratch blocks in docs | Turning scratch into Facts / Assumptions / Open |
| Answers to `verification-questions.md` | Asking **file-based** questions with proposed answers |

The user should never have to: search the web, read the whole kit, remember state, or write procedure. The agent should never: decide a gate alone, expand scope, or ask an open question without a proposal.

## 1b. Design semantics (recognition vs factors)

When the work is design / requirements / architecture / planning:

| Prefer | Avoid |
|--------|-------|
| Propose **factors** (function · action · property) to register / combine | Defaulting to a **class hierarchy** as the only shape |
| Use **object** = recognition / naming / spec | Equating object with code `class` |
| Message / event-driven options | Requiring class-centric OOP or GoF |
| Stack (Rust, C++, …) as **means** | Elevating stack to philosophy core |

**Misalignment signs** (pause and realign): recognition forced into inheritance · factors omitted · “action = execution only” · image/terms not shared before Do.

Canonical: [DESIGN_SEMANTICS.md](./DESIGN_SEMANTICS.md) · Rule: `rules/design-semantics-guard.mdc`

## 2. Decision protocol (every decision point)

```
Agent: options A / B / (C) · one-line tradeoff each · **Recommended: X because …**
User : picks or says Go
Agent: records decision (plan / project-state / audit-log) and proceeds
```

- ≤3 options. Default = recommended if the user says "any" / "任せる".
- Unknowns are stated as **Open** with a proposed default, not hidden.
- Never block on a question the agent can answer by reading files or searching the web.

## 3. Versatility floor (agent must be able to)

| Capability | Where |
|------------|-------|
| Research | `landscape-research` · `terminology-research` · WebSearch in P5–P6 for APIs |
| Design / plan / build / patch / review / evaluate | 9 roles (`docs/CURSOR_ROLES.md`) |
| Git / GitHub | `git-reference` · `git-record` |
| Browser / UI verification | cursor-ide-browser (`cursor-tool-select`) |
| Memory / learning recall | `pm-turn-start` (nav → index → global → learning tags) |
| Kit self-maintenance | `kit_maintainer` |

If a task falls outside all rows → say so explicitly and propose the nearest role; do not silently narrow the request.

## 4. Output discipline (context minimization)

| Goes to file | Stays in chat |
|--------------|---------------|
| turn brief · trace · decisions · research notes | ≤3-line summary + the decision request (if any) |
| Facts / Assumptions / Open | link to the file |
| Long tables / logs | path + one-line verdict |

Enforcement: **llm-soft** — fallback: `pm-turn-end` flags `chat_heavy: true` in the episode when the reply exceeds ~30 lines without a file write.
