# Bootstrap プロンプト（正本）

エージェントにキット導入を依頼するときの文言雛形。  
契約: [`BOOTSTRAP_MANIFEST.md`](./BOOTSTRAP_MANIFEST.md) · 実行: `scripts/copy-kit.ps1` / `copy-kit.sh`  
コードネーム（推奨）: [`CODENAMES.md`](./CODENAMES.md) · 一覧 [`codenames.html`](./codenames.html)

**コードネームで呼ぶ場合**: `手順-スタートアップ-1`（`./.agents` 配置済み）または `手順-スタートアップ-2`（ゼロから）に `PROJECT_NAME` · `PROJECT_PATH` を添える。手順本文はパッケージ定義を辿る。

## 前提

- 丸ごとコピー（Explorer / `Copy-Item -Recurse` 全ツリー）**禁止**
- `learning/` 横断トピックはホーム正本のみ
- `memory/global` knowledge はホーム正本 · 利用先はポインタ MD のみ
- P0 charter は bootstrap **完了後**の別ターン

---

## テンプレ（コピー済み `.agents/` がある場合）

```markdown
kit_maintainer として maintain-bootstrap を実行してください。

対象: このリポジトリ（./.agents/ は copy-kit で配置済みであること）

## 埋める情報
- PROJECT_NAME: {{PROJECT_NAME}}
- ONE_LINE_DESCRIPTION: {{ONE_LINE_DESCRIPTION}}
- TECH_STACK: {{TECH_STACK}}
- STACK_LANG_DOC: {{}}
- STACK_FRAMEWORK_DOC: {{}}
- STYLE_GUIDE: {{}}

## やること
1. 未配置なら: `%USERPROFILE%\.agents\scripts\copy-kit.ps1 -Dest .\.agents`（-WhatIf で確認可）
2. bootstrap-steps.md（§0 Kit copy 済み前提）に従い AGENTS.md · docs 骨格 · memory example → live · link-cursor · env setup
3. memory/global/README.md がポインタであること（knowledge 実体なし）を確認
4. learning/ に横断トピック実体が無いことを確認
5. `.\.agents\scripts\verify-bootstrap.ps1 -AgentsDir .\.agents` → ISSUES=0
6. §8 Verify チェックリストを報告

P0 charter 起草は次ターンに回してください。
```

---

## テンプレ（ゼロから · フォルダ作成込み）

```markdown
新規プロジェクトを Agent PDCA キットで立ち上げてください。

## プロジェクト
- 名称: {{PROJECT_NAME}}
- パス: {{例: C:\Users\...\Developer\my-app}}
- 一行説明: {{ONE_LINE_DESCRIPTION}}
- スタック: {{TECH_STACK}}

## 依頼（kit_maintainer）
1. ディレクトリ作成（未作成なら）
2. `%USERPROFILE%\.agents\scripts\copy-kit.ps1 -Dest <project>\.agents`（丸ごとコピー禁止）
3. git-init（任意）→ link-cursor → env/bin/setup.ps1
4. maintain-bootstrap（AGENTS.md · docs 骨格 · nav 等）
5. verify-bootstrap → ISSUES=0 を報告

## 境界
- キット正本（~/.agents）にプロジェクト固有内容を書かない
- learning 実データ / global knowledge をプロジェクトへコピーしない
- P0 設計は bootstrap 完了まで開始しない
```

---

## 完了判定

- `verify-bootstrap` → `ISSUES=0`
- `memory/global/README.md` がポインタ
- `learning/` が骨格のみ
- 次の next_action 候補: P0 `docs/design/product/charter.md` 草案
