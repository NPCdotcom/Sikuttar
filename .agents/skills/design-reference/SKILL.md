---
name: design-reference
description: Search existing design, requirements, ADR, and glossary before writing. Use when checking prior decisions or preparing a design edit.
---

<!-- GENERATED from registry/ — do not edit; run generate-expressions.py -->

# design-reference

**Role**: `spec_designer` · **Phase**: P0–P1–P2–P3

Expression surface generated from `registry/`. Factor bodies live in the registry; procedure detail lives at each factor's `owner` path.

## Properties (prop)

- `prop.design.cite_facts_assumptions_open` — 引用は path + section。本文は Facts / Assumptions / Open を分ける

## Actions (act)

- `act.design.search_prior` — glossary → requirements → design(H0→H5) → adr の順に既存を検索。status: agreed かつ現在の scope_level を優先
  - Detail: [`skills/design-reference/references/search-order.md`](../design-reference/references/search-order.md)

## Paths (path)

- `path.design.infra` — docs/design/_template/infrastructure/ → docs/design/systems/<slug>/

## Do-not (prop ids)

- `prop.design.cite_facts_assumptions_open`

## Owners

Do not restate factor text in references. Follow owner paths for steps.
