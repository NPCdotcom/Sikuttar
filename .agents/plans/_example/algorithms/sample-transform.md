---
title: 
kind: plan
status: draft
scope_level: algorithm
pdca_class: S1
pdca_eligible: true
related_design: docs/design/programs/example-normalize.md
related_requirements: docs/requirements/sample-capability/要件.md
parent_hierarchy:
  product: docs/design/product/charter.md
  element: docs/design/elements/example-export.md
  system: ""
  framework: ""
---

# Example plan（algorithm）— 置換して使用

> **サンプル**: 文字列正規化。**因子単位** AC の書き方例。実プロジェクトでは全文差し替え。

## Goal

選択されたテキストフィールドを、出力前に定義済みルールで正規化する。

## Scope hierarchy

| Level | Path | Status |
|-------|------|--------|
| H0 product | docs/design/product/charter.md | draft |
| H1 element | docs/design/elements/example-export.md | draft |
| H4 program | docs/design/programs/example-normalize.md | draft |
| H5 algorithm | （this plan） | draft |

## Factors in this plan

| Factor | Kind | Recognition it supports |
|--------|------|-------------------------|
| `trim` | function | text-field normalize |
| `normalize-newlines` | function | text-field normalize |

## Scope

### In scope

- 単一文字列 in → 正規化 out の純関数（因子の組み合わせ）
- ルールセット 2 種（上表）

### Out of scope

- ファイル IO、UI、並列処理、クラス階層の導入

## Acceptance criteria（≤5 · 因子単位）

- [ ] factor `trim`: 前後空白を除去する
- [ ] factor `normalize-newlines`: `\r\n` を `\n` に統一する
- [ ] 組み合わせ: 空文字列はエラーにせず空のまま返す
- [ ] 既存テストコマンドが通る（利用先のスタックに合わせる）

## Agent recommendations

**推奨**: program 設計の Factors 表を先に固定してから本 H5 を implement。クラス図は任意。

## User thinking

> 

## Open questions

- ルール追加はデータ駆動登録かコード分岐か？（登録を推奨）

## PDCA log

| Date | Phase | Note |
|------|-------|------|
| | Plan | example only |
