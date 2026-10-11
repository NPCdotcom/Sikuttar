# Project memory（scope: project / git 外）

**Read リポジトリ専用**の作業記憶。横断知識は **global 層** へ。

| Tier | Path |
|------|------|
| project index | `index.yaml`, `index/shards/` |
| state | `state/` + `docs/project-state.yaml`（team） |
| episodes | `episodes/` |
| **traces** | `traces/`（append-only） |
| **audit** | `audit/audit-log.md`（append-only · AI-DLC audit 相当） |
| **evaluations** | `evaluations/`（turn scores） |
| **rewards** | `rewards/rollup.yaml` |
| knowledge | `alignment/`, `lessons/` |
| history | `history/` |

**Global 層（ホーム正本）**: `%USERPROFILE%\.agents\memory\global\`  
**Consumer ポインタ**: `./.agents/memory/global/README.md` のみ（knowledge 実体は置かない）

**Flow**: recall → reason → act → **evaluate → critique** → flush → **refine** → record

正本: [MEMORY_ARCHITECTURE.md](../docs/MEMORY_ARCHITECTURE.md) · [AGENT_EVALUATION.md](../docs/AGENT_EVALUATION.md) · [BOOTSTRAP_MANIFEST.md](../docs/BOOTSTRAP_MANIFEST.md)

## Bootstrap

Project 層（example から生成）:

```bash
cp .agents/memory/index.yaml.example .agents/memory/index.yaml
cp .agents/memory/state/nav.yaml.example .agents/memory/state/nav.yaml
cp .agents/memory/audit/audit-log.md.example .agents/memory/audit/audit-log.md
cp skills/memory-refine/assets/rewards/rollup-template.yaml .agents/memory/rewards/rollup.yaml
```

Global ポインタ（copy-kit が配置 · 無い場合）:

```bash
cp skills/memory-reference/assets/global/CONSUMER_POINTER.md .agents/memory/global/README.md
```

## Git

`.agents/memory/` は **commit しない**。ホーム `memory/global/` も commit しない。