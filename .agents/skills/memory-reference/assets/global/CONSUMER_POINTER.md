# Global memory — 正本はホーム（このディレクトリには実体を置かない）

このパス（`./.agents/memory/global/`）は **ポインタ専用**です。  
`index.yaml` や `knowledge/` がここに無いのは **正常**です。

## 正本パス（ランタイムで参照）

| OS | Path |
|----|------|
| Windows | `%USERPROFILE%\.agents\memory\global\` |
| macOS / Linux | `~/.agents/memory/global/` |

詳細: `skills/memory-reference/references/global-paths.md` · `docs/MEMORY_ARCHITECTURE.md` · `docs/BOOTSTRAP_MANIFEST.md`

## 書いてよい場所 / 書いてはいけない場所

| 内容 | 先 |
|------|-----|
| 横断哲学 · 好み · 汎用 lessons（Learning 昇格後） | **ホーム正本** `…/memory/global/knowledge/` |
| プロジェクト episode · thread · nav | `./.agents/memory/`（project 層） |
| 未検証の学習メモ | ホーム `…/learning/<topic>/` または 本 repo の `./.agents/learning/<topic>/` |

**このディレクトリに `knowledge/` や `index.yaml` を置かないでください。**  
recall / write は常にホーム正本を使います（`memory-reference` · `memory-record`）。

## Recall

1. `memory-reference` Phase 0: project `nav.yaml`
2. project `index.yaml`（budget）
3. **ホーム** `memory/global/index.yaml`（budget · 欠落時は `global_index: missing`）
