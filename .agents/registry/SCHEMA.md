# Registry schema

## Factor record（必須 / 任意）

| キー | 必須 | 意味 |
|------|------|------|
| `id` | yes | 安定 id（例 `prop.design.terminology_first`） |
| `kind` | yes | `act` · `prop` · `cap` · `path` · `template` |
| `text` | yes | 1 行の作用/性質文（修辞なし） |
| `when` | no | 発火条件（phase · role · writes · utterance_tags） |
| `next` | no | 合法な次（`rel` · `to` · `when`） |
| `why` | no | **docs パスのみ**（理由文は書かない） |
| `owner` | no | 実装詳細ファイル（手順の置き場 · 性質の再掲先ではない） |
| `requires` | no | 他因子 id のリスト |
| `cost` | no | 相対コスト整数 |
| `writes` | no | 書いてよいパス glob |
| `dup` | no | 監査用 · 旧言い換え箇所（実行時未使用） |
| `provided_by` | no | cap が指す skill パス |

## Cluster file

```yaml
status: registered
meta:
  cluster: C6a-design
  recognition: spec_designer   # 認識名（Role）。容器ではない
  phase: [P0, P1, P2, P3]
factors: []
edges: []                      # クラスタ跨ぎの辺のみ（クラスタ内は from 側 next）
```

## Expression file

| キー | 必須 | 意味 |
|------|------|------|
| `name` | yes | 発現名（skill 時は `skills/<name>/SKILL.md`） |
| `kind` | no | `skill`（省略時）· `rule` |
| `path` | rule 時 yes | 出力パス（例 `rules/design-stewardship.mdc`） |
| `description` | no | 対象 frontmatter 未設定時のフォールバックのみ |
| `factors` | yes | 因子 id リスト |

```yaml
expressions:
  - name: design-record          # kind 省略 = skill → skills/<name>/SKILL.md
    description: "..."
    factors: [id, ...]
  - name: design-stewardship
    kind: rule
    path: rules/design-stewardship.mdc
    factors: [id, ...]
```

## Package record（`registry/packages/<id>.yaml`）

人間が発するコードネーム・パッケージ。手順本文は書かない（因子 id 参照のみ）。

| キー | 必須 | 意味 |
|------|------|------|
| `codename` | yes | 完全形式 `区分-固有名-番号`（例 `手順-スタートアップ-1`） |
| `id` | yes | ASCII kebab（skill/ディレクトリ互換 · `a-z0-9-`） |
| `kind` | yes | `procedure` · `protocol` · `operation`（ゲート重さ） |
| `category` | no | モチーフ族（ユーザー定義 · 例 `launch`） |
| `definition` | yes | 何を指すか 1 行（比喩説明は不要） |
| `variants` | no | 末尾番号 → `{ definition, when }`（環境・対象の違いのみ） |
| `inputs` | no | `required` · `optional` · `on_missing`（`ask` \| `elicit`） |
| `brief` | yes | `role` · `skills` · `factors`（因子 id 列） |
| `caveats` | no | 実行中に織り込む prop id 列 |
| `gate` | no | `confirm_before_run` · `confirm_points` |
| `done` | no | 完了チェック列 |
| `recognizes` | no | 完了後に Agent が持つ認識（短文） |
| `then` | no | 完了後の次（`to` = package id または因子 id） |
| `state_after` | no | nav / project-state 更新ヒント |

定数（生成器が強制）:

```text
codename_regex: ^(手順|プロトコル|オペレーション)-[^\s\-]{2,8}-\d{1,2}$
reserved_concepts_warn: [Hermes, Subagent, Task]   # 字句衝突しなくても警告
```

生成: `python env/bin/agents-run.py maintain-adhoc generate-codenames`  
→ `registry/packages/index.yaml` · `docs/codenames.html`

## 禁止

- 因子に理由の長文を書く（`why` はパス）— `prop.kit.factors_do_not_carry_rationale`
- docs が因子本文を再説明すること — `prop.kit.docs_do_not_restate_factors`
- 発現面（GENERATED SKILL.md / `*.mdc` / packages/index.yaml / codenames.html）への手編集
- 同一辺を因子 `next` と `edges` の両方に書く
- パッケージに手順本文・理由長文を書く（因子 / docs が所有）

検査: `python env/bin/agents-run.py maintain-adhoc check-factor-split`
