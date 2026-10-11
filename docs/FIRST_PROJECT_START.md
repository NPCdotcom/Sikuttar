# 最初の実プロジェクトを始める（汎用）

> **キット利用先**向け。特定製品名・ドメインは書かない。`{{...}}` を置換して使う。

## 0. キット配置（copy-kit · 必須）

正本: [BOOTSTRAP_MANIFEST.md](./BOOTSTRAP_MANIFEST.md) · プロンプト: [BOOTSTRAP_PROMPT.md](./BOOTSTRAP_PROMPT.md)

```powershell
# ホームキットから（丸ごとコピー禁止）
%USERPROFILE%\.agents\scripts\copy-kit.ps1 -Dest <project>\.agents
%USERPROFILE%\.agents\scripts\copy-kit.ps1 -Dest <project>\.agents -WhatIf   # dry-run
```

- `learning/` 横断トピックはコピーしない
- `memory/global/README.md` はホーム正本へのポインタのみ

## 1. Bootstrap 後にコピーするもの（docs 骨格）

| キット内（`.agents/docs/`） | 利用先（リポジトリ `docs/`） |
|---------------------------|------------------------------|
| `PROJECT_LIFECYCLE.md` | `docs/PROJECT_LIFECYCLE.md` |
| `project-state.template.yaml` | `docs/project-state.yaml`（下記初期値） |
| `LINEAR_PHASE_MAP.md` | 任意 |
| `CONSUMER_DOCS_README.template.md` | `docs/README.md` |
| `_example/` 一式 | 参照 or コピー（**リネーム必須**） |

`maintain-bootstrap` が上記を自動化できる。手動でも可。

## 1b. ローカル Git（必須）

```powershell
.\.agents\scripts\git-init.ps1                                   # main · .gitignore · 初回 commit
.\.agents\scripts\git-init.ps1 -Remote github.com/<owner>/<repo> # GitHub も使うとき（任意）
```

以降のコミットは **ゲート単位**（P4 agreed → `plan/<slug>` ブランチ、P5 criterion green → commit、P6 pass → merge）。正本: [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) · `git_policy.auto_commit` は既定 `ask`。

## 2. `project-state.yaml` と `nav.yaml` の初期値

### project-state.yaml

```yaml
current_phase: P0
phase_note: "New project — defining product charter"
scope_focus:
  level: H0
  path: docs/design/product/charter.md
active_pdca:
  plan_path: ""
  scope_level: ""
  pdca_class: ""
gate_status:
  current: pending
  proposal: ""
  last_decision: ""
  last_decided_at: ""
  conditions: []
  gate_keeper: user
last_gate_passed: ""
allowed_actions:
  - design-deliberate
  - design-record
open_blockers: []
```

### nav.yaml（Control Plane · 毎ターン）

```bash
cp .agents/memory/state/nav.yaml.example .agents/memory/state/nav.yaml
```

`session.intent` · `navigation.next_actions`（≤3）を毎ターン更新。正本: `docs/PM_ROUTING.md`

### hooks（summarize 先制 · 推奨）

キットの `hooks.json` + `hooks/*.py` をプロジェクト `.agents/` に配置（`maintain-bootstrap` 参照）。

## 3. 推奨作成順（H 高 → 低）

| 順 | 工程 | パス（例） | 備考 |
|----|------|------------|------|
| 1 | P0 | `docs/design/product/charter.md` | `_example` または `_charter-template` |
| 2 | P1 | `docs/requirements/<your-slug>/要求.md` | slug は英数字 kebab（**sample-capability は例**） |
| 3 | P2 | 同フォルダ `要件.md` | `>` に殴り書き → 推敲 |
| 4 | P3 | `docs/design/elements/`, `systems/`, … | 上位 H を先に |
| 5 | P4 | `.agents/plans/programs/` or `algorithms/` | **PM がユーザー確認**後 |
| 6 | P5–P6 | ソース + review | plan `agreed` のみ大規模 Do |

## 4. `_example/` の使い方

- **目的**: 空テンプレだけでは想像しづらい場合の**中立サンプル**（ゲーム・業界非依存）
- **必須ではない**。不要なら `_example/` ごと削除してよい
- コピー時は `sample-capability` → **自分の slug** にリネームし、本文の「例」「サンプル」を消す

## 5. PDCA を回す単位（再確認）

- **主**: `scope_level: program` または `algorithm` の plan 1 件 = 1 サイクル
- **前**: その program/algorithm が **何のため** か（H0–H3）を design / requirements でリンク

## 6. エージェントとの推敲

1. PM が `role-execute` で `spec_designer` スキル列を実行 — 草案 + **選択肢・おすすめ**  
2. ユーザーが `>` ブロックに思考を追記  
3. 確定部分を本文へ移動 → `status: agreed` は**ユーザー確認後**のみ  

## 参照

- [PROJECT_LIFECYCLE.md](./PROJECT_LIFECYCLE.md)
- [requirements/README.md](./requirements/README.md)
- [requirements/_template/](./requirements/_template/)
- [_example/README.md](./_example/README.md)
