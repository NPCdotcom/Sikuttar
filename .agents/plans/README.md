# Plans Index

**実装計画（P4+）** の正本。思案・仕様: `docs/design/`。要求・要件: `docs/requirements/`。

ライフサイクル: [docs/PROJECT_LIFECYCLE.md](../docs/PROJECT_LIFECYCLE.md)

## フォルダ（スコープ階層）

| フォルダ | scope_level | PDCA Do |
|----------|-------------|---------|
| `product/` | H0 | 通常しない（`pdca_eligible: false`） |
| `elements/` | H1 | 通常しない |
| `systems/` | H2 | 通常しない |
| `frameworks/` | H3 | S0 スパイクのみ |
| `programs/` | H4 | **主戦場** |
| `algorithms/` | H5 | **主戦場** |

**原則**: 1 plan = 1 PDCA サイクル（S0 or S1）。program / algorithm が主；H5 は **因子単位**。Semantics: [docs/DESIGN_SEMANTICS.md](../docs/DESIGN_SEMANTICS.md)。

## Actions

| Action | Skill / Agent |
|--------|----------------|
| Readiness | `plan-reference`, `lifecycle-reference` |
| Record | `plan-record` |
| Mid-plan evaluation | `plan-evaluate`, **`evaluator`** |
| Bundled | **`plan_slicer`** |

Template: [_template.md](_template.md)  
Example（中立・削除可）: [_example/](_example/)

## Plans

| Plan | scope_level | Status | Summary |
|------|-------------|--------|---------|
| [programs/s1-scaffold.md](programs/s1-scaffold.md) | program | agreed · Do done | S0 · Worker+Hono+D1+Vite 足場 |
| [algorithms/persist-failure-story.md](algorithms/persist-failure-story.md) | algorithm | agreed · Do done | S1 · validate · authorKey · persist |
| [algorithms/list-anonymized-feed.md](algorithms/list-anonymized-feed.md) | algorithm | agreed · Do done | S1 · list · anonymize |
| [programs/ui-compose-and-feed.md](programs/ui-compose-and-feed.md) | program | agreed · Do done | S1 · 投稿フォーム+フィード UI |
| [algorithms/ensure-account-slot.md](algorithms/ensure-account-slot.md) | algorithm | agreed · Do done | S1 · FR8 accounts 属性スロット |
| [programs/ui-reactions-on-feed.md](programs/ui-reactions-on-feed.md) | program | agreed · Do done · Go | S2 · わかる／参考になる UI |
| [algorithms/persist-reaction.md](algorithms/persist-reaction.md) | algorithm | agreed · Do done · Go | S2 · validate · persist reaction |
| [algorithms/count-public-reactions.md](algorithms/count-public-reactions.md) | algorithm | agreed · Do done · Go | S2 · public counts · mask bad |

| [algorithms/find-related-stories.md](algorithms/find-related-stories.md) | algorithm | agreed · Do done · Go | S3 · Jaccard · top3 |
| [programs/ui-related-on-feed.md](programs/ui-related-on-feed.md) | program | agreed · Do done · Go | S3 · 関連展開 UI |

**実行順**: scaffold → persist / list → ui · S2 reactions · **S3** find-related / ui-related（branch `plan/s3-related-failures`）

Rules: `planning`, `plans-content`, `project-lifecycle`
