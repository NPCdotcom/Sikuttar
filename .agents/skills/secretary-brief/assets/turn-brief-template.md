# Turn Brief（Loop1 · 毎ターン）

**Output**: **file** — `.agents/memory/episodes/YYYY-MM-DD-<slug>.md` §Brief（`pm-turn-start/assets/turn-episode-template.md`）。チャットには ≤3 行の要約のみ。

**Prerequisite**: context-guard · memory-reference Phase 0 · memory-reason（mini/full）

**P/H/gate**: `nav.yaml` の `alignment.*` を **引用**（`prop.state.loop1_quote_loop2_sync`）— Loop1 では lifecycle 再推論 **禁止**。

## ユーザー発話（要約）
-

## nav 引用（正本）
| 項目 | 値（nav / project-state） |
|------|---------------------------|
| session_intent | |
| next_actions | |
| phase / H | |
| gate | |
| active_plan | |
| **Cursor mode** | `lifecycle_plan.recommended_cursor_mode`（G1 出力 · 空なら adaptive 提案） |

## トピック T1
| 区分 | 内容 |
|------|------|
| 今ターンの要求 | |
| gate（当ターン） | pass / block |
| 禁止 | gate/phase 由来のみ（例: `implement-conduct`） |

## Role 割当

| 順 | Role | スキル | ペイロード |
|----|------|--------|------------|
| | | | |

（Role 0 = read-only · evaluate **mini**）

## PM 実行
- [ ] `prop.kit.role_execute_pm_only`（Role 行）
- [ ] evaluate: full | mini | skip
- [ ] flush → record（`prop.memory.nav_update_every_turn`）

`本ターン: turn-brief 完了 → prop.kit.role_execute_pm_only → memory 書込`
