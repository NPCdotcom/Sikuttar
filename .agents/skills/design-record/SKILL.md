---
name: design-record
description: Write design and requirements markdown under docs/ with Facts/Assumptions/Open. Use when drafting charters, 要求, 要件, or design docs—not plans or ADR.
---

<!-- GENERATED from registry/ — do not edit; run generate-expressions.py -->

# design-record

**Role**: `spec_designer` · **Phase**: P0–P1–P2–P3

Expression surface generated from `registry/`. Factor bodies live in the registry; procedure detail lives at each factor's `owner` path.

## Properties (prop)

- `prop.design.terminology_first` — P0–P3 で 要求/要件/設計 の用語を扱う前に terminology-research の alignment が存在すること。無ければ block
- `prop.design.agreed_requires_user_confirm` — frontmatter status: agreed はユーザー確認後のみ
- `prop.design.write_bounds` — spec_designer が書くのは docs/design · docs/requirements · docs/adr · docs/glossary。.agents/plans とアプリコードは書かない

## Actions (act)

- `act.design.record` — 設計/要求/要件を frontmatter 付きで書く。Recognition / Factors を節で分ける。deliberation 由来なら promoted_from を付ける。scope_level を設定
  - Detail: [`skills/design-record/references/save-paths-by-phase.md`](../design-record/references/save-paths-by-phase.md)
- `act.design.update_index` — docs/README.md または requirements README の索引を更新
  - Detail: [`skills/design-record/references/save-paths-by-phase.md`](../design-record/references/save-paths-by-phase.md)
- `act.design.handoff_plan` — P3 gate 通過 + H4/H5 設計あり → plan_slicer へ引き渡し
  - Detail: [`skills/design-record/references/prerequisites.md`](../design-record/references/prerequisites.md)

## Paths (path)

- `path.design.P0` — docs/design/product/
- `path.design.P1_P2` — docs/requirements/<slug>/要求.md | 要件.md
- `path.design.P3` — docs/design/{elements,systems,frameworks,programs}/

## Templates (template)

- `template.design.record` — skills/doc-record/assets/templates/design.md

## Do-not (prop ids)

- `prop.design.terminology_first`
- `prop.design.agreed_requires_user_confirm`
- `prop.design.write_bounds`

## Owners

Do not restate factor text in references. Follow owner paths for steps.
