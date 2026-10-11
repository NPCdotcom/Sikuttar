# Bootstrap — workflow steps

## 0. Kit copy（必須 · 丸ごとコピー禁止）

正本: [`docs/BOOTSTRAP_MANIFEST.md`](../../../docs/BOOTSTRAP_MANIFEST.md)

1. キットホームから **`scripts/copy-kit.ps1 -Dest <project>\.agents`**（Unix: `copy-kit.sh`）を実行
2. `-WhatIf` / `--dry-run` で `learning/` トピック実体と `memory/global/knowledge` が計画に含まれないことを確認
3. コピー後: `./.agents/memory/global/README.md` がポインタ（[`CONSUMER_POINTER.md`](../../memory-reference/assets/global/CONSUMER_POINTER.md)）であること
4. **しないこと**: `%USERPROFILE%\.agents` を Explorer / `Copy-Item -Recurse` で丸ごと複製（`learning/` ~30GB を巻き込む）

Include/exclude: `scripts/templates/copy-kit.include` · `copy-kit.exclude`

## 1. Project context（ユーザー確認）

Collect without writing into **kit source repo**（`~/.agents` 正本にプロジェクト固有内容を書かない）。

## 1b. Local Git（必須 · `docs/GIT_WORKFLOW.md`）

1. `.\.agents\scripts\git-init.ps1`（Unix: `./.agents/scripts/git-init.sh`）— `main` init · `.gitignore` · `.gitattributes` · `.gitmessage` · 初回 commit
2. Stack 固有の ignore 行（`node_modules/`, `build/` 等）を `.gitignore` 末尾 `# --- Stack ---` 以下へ追記（AGENTS.md stack docs から）
3. GitHub を使う場合のみ: `-Remote github.com/<owner>/<repo>`（gh · ユーザー確認あり）
4. `docs/project-state.yaml` の `git_policy` を確認（default `auto_commit: ask`）

## 2. Root AGENTS.md

Copy `.agents/AGENTS.md.template` → `AGENTS.md` · fill placeholders.

## 3. docs/ skeleton

See [`docs-skeleton.md`](docs-skeleton.md).

## 3b. `.agents/env/`（エージェント実行環境）

1. `.\env\bin\setup.ps1`（または `./env/bin/setup.sh`）— Python venv 作成（**copy-kit は venv をコピーしない**）
2. 検証: `python env/bin/agents-run.py maintain-adhoc audit-skill-layout skills` → `OK: no layout issues`

正本: [`env/README.md`](../../env/README.md) · ポリシー: [`skills/_SCRIPT_POLICY.md`](../../skills/_SCRIPT_POLICY.md)

## 4. `.agents/memory/`（bootstrap 契約 · 欠落禁止）

**必須**（無い場合は作成してから続行。fail-soft 禁止）:

| Path | 用途 |
|------|------|
| `index.yaml` | from `index.yaml.example` |
| `state/nav.yaml` | from `nav.yaml.example`（kit workspace: `session.intent=kit-maintenance`） |
| `audit/audit-log.md` | from `audit-log.md.example` |
| `episodes/` | directory（README 可 · L1 書き先） |
| `global/README.md` | **ポインタのみ**（ホーム正本を参照 · knowledge 実体は置かない） |

1. `cp .agents/memory/index.yaml.example .agents/memory/index.yaml`
2. `cp .agents/memory/state/nav.yaml.example .agents/memory/state/nav.yaml`
3. `cp .agents/memory/audit/audit-log.md.example .agents/memory/audit/audit-log.md`
4. `mkdir` `episodes/`（空で可）
5. Ensure `memory/global/README.md` = copy of `skills/memory-reference/assets/global/CONSUMER_POINTER.md`（copy-kit が配置済みなら確認のみ）
6. Ensure `.agents/hooks.json` + `.agents/hooks/*.py` exist
7. Run **`.agents/scripts/link-cursor.ps1`** → `.cursor/{rules,skills,hooks}` junction + `.cursor/hooks.json`
8. Ensure `knowledge/{alignment,lessons}/`, `state/`, `history/`, `traces/`, `audit/`, `evaluations/`, `rewards/`

## 5. `.agents/handoffs/`

Legacy README only — new briefs → `memory/episodes/`.

## 6. `.agents/plans/README.md`

Index table exists.

## 7. `rules/local/` lenses

From `AGENTS.md` stack docs.

## 7b. `learning/`（骨格のみ · 横断トピックはホーム正本）

| 配置 | 扱い |
|------|------|
| `%USERPROFILE%\.agents\learning\<topic>\` | **横断正本** — bootstrap でコピーしない |
| `./.agents/learning/_template/` 等 | copy-kit が骨格のみ配置 |
| プロジェクト固有トピック | ユーザーが `_template` から後追加 |

正本: [`docs/LEARNING_SANDBOX.md`](../../../docs/LEARNING_SANDBOX.md)

## 8. Verify

機械検証（推奨）:

```powershell
.\.agents\scripts\verify-bootstrap.ps1 -AgentsDir .\.agents
```

チェックリスト:

- [ ] `git rev-parse --is-inside-work-tree` → `true` · `git log --oneline` ≥ 1 commit
- [ ] `.gitignore` contains `.agents/memory/*` and `.cursor/rules` (junctions)
- [ ] `.agents/memory/index.yaml` exists
- [ ] `.agents/memory/state/nav.yaml` exists（not leftover from another project）
- [ ] `.agents/memory/episodes/` directory exists
- [ ] `.agents/memory/audit/audit-log.md` exists
- [ ] `.agents/memory/global/README.md` がポインタ · **`knowledge/` 実体なし** · **`index.yaml` なし**
- [ ] `learning/` に横断トピック実体がない（`_template` / README / index example のみ）
- [ ] `.agents/hooks.json` + `.agents/hooks/pre-compact.py` exist
- [ ] `.cursor/hooks.json` exists（link-cursor 後）
- [ ] No Hermes in `mcp.json`（`mcpServers: {}`）
- [ ] `env/python/.venv` exists（**setup 後のみ** · コピー由来でない）
- [ ] `python env/bin/agents-run.py maintain-adhoc audit-skill-layout skills` → ISSUES=0
- [ ] No subagent files
- [ ] copy-kit dry-run またはログで exclude（learning / global knowledge）が効いている

Apply via `maintain-record`.
