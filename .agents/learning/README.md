# Learning sandbox（学習・実験層）

**正本**: [`docs/LEARNING_SANDBOX.md`](../docs/LEARNING_SANDBOX.md) · **Rule**: [`rules/learning-sandbox.mdc`](../rules/learning-sandbox.mdc)

検証前の学習・調査・テストコード・ソース展開を置く場所。**team 正本（`docs/`）でも `memory/lessons/` でもない。**

## 配置

| パス | 用途 |
|------|------|
| **`learning/`**（本キットルート） | 横断トピック正本（CUDA、言語など）— **bootstrap でプロジェクトへコピーしない** |
| **`{project}/.agents/learning/`** | プロジェクト固有の学習（任意 · `_template` 骨格のみ copy-kit が配置） |

契約: [`docs/BOOTSTRAP_MANIFEST.md`](../docs/BOOTSTRAP_MANIFEST.md)

## 新トピック

```text
cp -r learning/_template learning/<topic>
# Windows: Copy-Item -Recurse learning\_template learning\<topic>
```

`manifest.yaml` と `README.md` を編集してから作業開始。

## ディレクトリ（トピック内）

| サブ | 用途 |
|------|------|
| `notes/` | Web 調査・読書メモ（**未検証 OK**） |
| `experiments/` | テスト・スパイク・デバッグ（壊してよい） |
| `sources/` | clone · SDK · 大容量教材（**git 除外**） |

## 昇格（出口）

```
learning/<topic>/notes|experiments
  → memory-flush（trace + critique 後）
  → global/project lessons または docs/glossary
```

**learning 内の未検証メモを lesson や docs に直接昇格しない。**

## 実行環境

| 層 | パス |
|----|------|
| キットメンテ | `.agents/env/` |
| トピック実験 | `learning/<topic>/.venv` 等（トピック専用） |
| アプリ本番 | プロジェクト `.venv` |

## 索引（任意）

アクティブトピックを追跡する場合: [`index.yaml`](index.yaml)（例: [`npcdotcom/`](npcdotcom/) — 設計思想・思考プロセス）
