# Plans — programs（H4）

プログラム（モジュール・コンポーネント）単位の **PDCA 計画**。親設計: `docs/design/programs/`。

設計側で **Recognition** と **Factors** を分けてから切る。H5 は Factors から派生。

| Field | 既定 |
|-------|------|
| `scope_level` | `program` |
| `pdca_eligible` | `true` |
| Prefer | 複数因子の配線・境界。単一因子なら `algorithms/`（H5）を検討 |

Semantics: [docs/DESIGN_SEMANTICS.md](../docs/DESIGN_SEMANTICS.md) · Template: [_template.md](../_template.md)
