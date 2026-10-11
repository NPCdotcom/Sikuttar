| Factor add / edit | Edit `registry/` → `python env/bin/agents-run.py maintain-adhoc generate-expressions` |
| Codename package add / edit | Edit `registry/packages/` → `python env/bin/agents-run.py maintain-adhoc generate-codenames` |
| Nav next decay | `python env/bin/agents-run.py memory-record apply-nav-decay -- --nav … --proposed … --turn N`（`prop.memory.next_decay`） |
| Expression freshness | `python env/bin/agents-run.py maintain-adhoc check-expression-freshness`（expressions · codenames） |
| Factor/docs split | `python env/bin/agents-run.py maintain-adhoc check-factor-split`（2 禁止） |
| Factor generate (compat) | `python scripts/generate-expressions.py`（正本 · agents-run と同処理） |
| New role mapping | Update `docs/CURSOR_ROLES.md`, `role-skill-catalog` |
| New memory skill | `assets/{index,state,episodes}/` + `memory/index.yaml` |
| PM routing sync | `rg context-guard docs/PM_ROUTING.md` · secretary-reference に lifecycle 毎ターン無し |
| Hermes residue | `rg -i hermes` → Owner `prop.kit.no_subagent` のみ許容（deprecated-aliases 除く） |
| Skill layout audit | `python env/bin/agents-run.py maintain-adhoc audit-skill-layout skills` |
| Script inventory | `python env/bin/agents-run.py maintain-scripts inventory skills` |
| Script review | `python env/bin/agents-run.py maintain-scripts review` |
| Script dedupe report | `python env/bin/agents-run.py maintain-scripts dedupe-report` |
| Agent env setup | `.\env\bin\setup.ps1` or `./env/bin/setup.sh` |
| Hooks bootstrap | `hooks.json` + `hooks/pre-compact.py` + `nav.yaml.example` |
