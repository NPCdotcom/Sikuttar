# Factor registry（因子レジストリ）

**語彙**: 認識 / 因子 / 登録 / 発現 のみ。

| 軸 | 置き場 | 書き手 |
|----|--------|--------|
| **認識** | `docs/` | 人間 + Agent |
| **因子** | **本ディレクトリ** | Agent（`kit_maintainer`）。人間は差分レビュー |
| **発現** | `skills/*/SKILL.md` · `rules/*.mdc` | **生成物**（書き戻し禁止 · 再生成） |

## レイアウト

| パス | 用途 |
|------|------|
| `SCHEMA.md` | フィールド契約（因子 · 発現 · パッケージ） |
| `index.yaml` | id → ファイル（内容再掲なし） |
| `kit.yaml` | 横断 kit 因子（I1/I2） |
| `shared.yaml` | クラスタ共有因子 |
| `clusters/<name>.yaml` | クラスタごとの因子 |
| `expressions/<name>.yaml` | 発現面（SKILL 名 → 因子集合） |
| `packages/<id>.yaml` | コードネーム・パッケージ正本（1 件 1 ファイル） |
| `packages/index.yaml` | 生成: 完全形式 → id（書き戻し禁止） |

## 登録 → 発現

```text
registry/clusters|expressions を編集
  → python env/bin/agents-run.py maintain-adhoc generate-expressions
  → skills/design-*/SKILL.md · rules/design-stewardship.mdc（GENERATED）
  → python env/bin/agents-run.py maintain-adhoc check-expression-freshness

registry/packages/*.yaml を編集
  → python env/bin/agents-run.py maintain-adhoc generate-codenames
  → registry/packages/index.yaml · docs/codenames.html（GENERATED）
```

互換: `python scripts/generate-expressions.py` · `python scripts/generate-codenames.py`（正本は `scripts/`）。書き戻し禁止 · 差分は再生成のみ。

切り分け検査（2 禁止）:

```text
python env/bin/agents-run.py maintain-adhoc check-factor-split
```

詳細手順は owner パス（`skills/.../references/`）に残す。性質文はレジストリが唯一の所有者。

## 関連

- Why / 切り分け: `docs/DESIGN_SEMANTICS.md` · learning `ai-asset-curation/notes/07-decisions-and-ai-human-split.md`（読み取り専用）
- Bootstrap: `docs/BOOTSTRAP_MANIFEST.md`（`registry/` は INCLUDE）
