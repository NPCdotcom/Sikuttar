# BOOTSTRAP_MANIFEST — キット取り込み契約

**正本**: 利用先プロジェクトへ `%USERPROFILE%\.agents`（Unix: `~/.agents`）から何をコピーするか。  
**機械可読**: [`scripts/templates/copy-kit.include`](../scripts/templates/copy-kit.include) · [`scripts/templates/copy-kit.exclude`](../scripts/templates/copy-kit.exclude)  
**実行**: [`scripts/copy-kit.ps1`](../scripts/copy-kit.ps1) · [`scripts/copy-kit.sh`](../scripts/copy-kit.sh)  
**プロンプト**: [`BOOTSTRAP_PROMPT.md`](./BOOTSTRAP_PROMPT.md)

> **丸ごとコピーは禁止。** `learning/` 実データはホーム正本のみ（概算 ~30GB）。キット本体は概ね **1MB 未満**。

## 二層の除外

| 種類 | ファイル | 意味 |
|------|----------|------|
| **コピー除外** | `copy-kit.exclude` | 物理コピーしない |
| **Git 除外** | `scripts/templates/gitignore.consumer` | commit しない |

Git 除外済みでもコピーしてよいわけではない。**コピー除外が先**。

## INCLUDE（利用先 `./.agents/` へ）

| パス | 備考 |
|------|------|
| `skills/` | 手順書一式 |
| `rules/` | generic rules（`local/` テンプレ含む） |
| `hooks/` · `hooks.json` | preCompact · stop |
| `docs/` | キット文書 |
| `plans/` | README · テンプレ |
| `scripts/` | copy-kit · link-cursor · git-init · templates · generate-expressions · generate-codenames |
| `registry/` | 因子レジストリ（clusters · kit · expressions · **packages/**） |
| `docs/codenames.html` | コードネーム一覧（GENERATED · `registry/packages/` から） |
| `automations/` | Automation 雛形 |
| `AGENTS.md.template` · `mcp.json.template` | ルートへ展開用 |
| `env/` ソースのみ | `bin/` · `python/lib/` · `requirements.txt` 等（**venv 除外**） |
| `memory/` テンプレ類 | `*.example` · `**/README.md` · `_template.md` |
| `learning/_template/` · `learning/README.md` · `learning/index.yaml.example` | プロジェクト固有学習の骨格のみ |
| `handoffs/README.md` | legacy 説明のみ |

## EXCLUDE（絶対にコピーしない）

| パス | 理由 |
|------|------|
| `learning/**`（`_template` / `README.md` / `index.yaml.example` 以外） | 横断学習正本 · 巨大（sources 含む） |
| `memory/global/index.yaml` · `memory/global/knowledge/**` | ホーム正本 `%USERPROFILE%\.agents\memory\global\` |
| `memory/state/nav.yaml` · `episodes/` · `traces/` · `evaluations/` · `history/` · `rewards/rollup.yaml` | プロジェクト live データ（example から再生成） |
| `env/python/.venv/` · `env/node/node_modules/` | `env/bin/setup` で再生成 |
| `.cursor/` | `link-cursor` で junction 再生成 |

## Global 層（コピーせず参照）

| 場所 | 内容 |
|------|------|
| **正本** | `%USERPROFILE%\.agents\memory\global\`（Unix: `~/.agents/memory/global/`） |
| **利用先** | `./.agents/memory/global/README.md` のみ（ポインタ · テンプレ [`CONSUMER_POINTER.md`](../skills/memory-reference/assets/global/CONSUMER_POINTER.md)） |

Learning で検証済みの教訓はホーム `global/knowledge/` へ昇格。利用先へ knowledge 実体をコピーしない。

## Learning 層

| 配置 | 用途 |
|------|------|
| `%USERPROFILE%\.agents\learning\<topic>\` | 横断学習正本（bootstrap 対象外） |
| `./.agents/learning/_template/` 等 | プロジェクト固有トピックを後から追加する骨格 |

詳細: [`LEARNING_SANDBOX.md`](./LEARNING_SANDBOX.md)

## 導入順

1. `scripts/copy-kit.ps1 -Dest <project>\.agents`（または `.sh`）
2. `scripts/git-init.ps1`（任意）
3. `scripts/link-cursor.ps1`
4. `env/bin/setup.ps1`
5. `kit_maintainer` + `maintain-bootstrap`
6. 検証: `scripts/verify-bootstrap.ps1` または bootstrap-steps §8

## サイズ目安（参考）

| 領域 | 概算 |
|------|------|
| コピー対象（skills/rules/docs/hooks/scripts/env ソース等） | **~1MB 未満** |
| `memory/global` 正本（ホーム · コピーしない） | 数百 KB 級 |
| `learning/` 正本（ホーム · コピーしない） | **~30GB**（トピック依存） |
