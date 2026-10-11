---
name: design-deliberate
description: Facilitate design options and tradeoffs before writing specs. Use when requirements are unclear or the user wants choices A/B/C.
---

<!-- GENERATED from registry/ — do not edit; run generate-expressions.py -->

# design-deliberate

**Role**: `spec_designer` · **Phase**: P0–P1–P2–P3

Expression surface generated from `registry/`. Factor bodies live in the registry; procedure detail lives at each factor's `owner` path.

## Properties (prop)

- `prop.design.terminology_first` — P0–P3 で 要求/要件/設計 の用語を扱う前に terminology-research の alignment が存在すること。無ければ block
- `prop.design.no_forced_class_hierarchy` — 設計の選択肢をクラス階層一択にしない。認識と因子を分けて書く
- `prop.design.agreed_requires_user_confirm` — frontmatter status: agreed はユーザー確認後のみ

## Actions (act)

- `act.design.identify_unfixed_h` — lifecycle-reference で未確定の H レベルを特定する
  - Detail: [`skills/design-deliberate/references/workflow-detail.md`](../design-deliberate/references/workflow-detail.md)
- `act.design.deliberate` — Goal 1 文 → Options 2–4（pros/cons · おすすめ 1）→ Recommendation + assumptions → Open questions → `>` 殴り書き欄
  - Detail: [`skills/design-deliberate/references/workflow-detail.md`](../design-deliberate/references/workflow-detail.md)

## Templates (template)

- `template.design.deliberation` — docs/design/_deliberation-template.md

## Do-not (prop ids)

- `prop.design.terminology_first`
- `prop.design.no_forced_class_hierarchy`
- `prop.design.agreed_requires_user_confirm`

## Owners

Do not restate factor text in references. Follow owner paths for steps.
