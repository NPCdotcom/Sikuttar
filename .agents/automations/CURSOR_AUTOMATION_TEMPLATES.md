# Cursor Automation Templates

`AUTOMATION_INSTRUCTION.md` と `docs/LINEAR_AUTOMATION_POLICY.md` に準拠した、実運用向けの雛形集。

## 0) 使い方

1. 本ファイルのテンプレをコピー
2. `{{...}}` プレースホルダを埋める
3. Automation に登録
4. テストは `plan_status=draft` と `agreed` の両方で実施（draft が必ず停止することを確認）

---

## 1) Linear: plan-agreed で Do 開始

### Trigger

- 種別: Linear issue updated
- 条件:
  - `project == {{LINEAR_PROJECT_KEY}}`
  - `state changed to plan-agreed`
  - `labels contains automation-enabled`（任意）

### Agent/Model

- Agent: `Composer 2.5 fast`

### Instruction (copy-ready)

```text
You are running an automation step for an agreed-plan cycle.

Hard requirements:
1) Operate only when plan status is agreed.
2) Never execute from draft plans.
3) Never widen scope beyond accepted criteria.
4) Use secretary-first routing, then delegated steward execution.

Run metadata:
- linear_project: {{LINEAR_PROJECT_KEY}}
- linear_issue_id: {{LINEAR_ISSUE_ID}}
- plan_path: {{PLAN_PATH}}
- related_design: {{RELATED_DESIGN_PATH}}

Execution contract:
- Validate gates using automation-reference.
- If gates fail, stop with result=needs_approval and reason.
- If gates pass, run automation-run with delegated steward/skills.
- Record result with automation-record.

Output format:
- status: done|blocked|needs_approval
- steward/skills executed
- criteria touched
- blockers
- proposed next state
```

### Approval Step

- 必須:
  - `plan_path` の frontmatter `status=agreed` を確認
  - Acceptance criteria が空でない
- 失敗時:
  - `#auto-{{project}}-approval` に停止理由を投稿

---

## 2) Linear: do-running 中の定期ヘルスチェック

### Trigger

- 種別: Scheduled（例: 2h ごと）
- 条件:
  - issue state is `do-running`
  - issue updated within last `{{ACTIVE_WINDOW}}`

### Agent/Model

- Agent: `Composer 2.5 fast`

### Instruction (copy-ready)

```text
Evaluate active do-running issues without changing implementation scope.

Rules:
- Read only evaluation context first.
- Do not run implementation directly in this automation.
- If risk is detected, route to evaluator and propose action.

For each issue:
- check linked plan status
- check criteria progress evidence
- detect blockers/scope drift

Return:
- health: on_track|at_risk|blocked
- evidence
- required human approval (yes/no)
- suggested next steward
```

### Approval Step

- `at_risk` / `blocked` 判定は `#auto-{{project}}-approval` へ自動通知

---

## 3) Linear: check-running でレビュー起動

### Trigger

- 種別: Linear issue updated
- 条件:
  - `state changed to check-running`
  - `plan_status == agreed`

### Agent/Model

- Agent: `Composer 2.5 fast`

### Instruction (copy-ready)

```text
Run review cycle for an agreed plan.

Constraints:
- Use reviewer flow.
- No new feature implementation here.
- If only narrow defects are found, route to hotfixer.
- If major scope gaps are found, route to plan/design steward.

Produce:
- prioritized findings
- required follow-up steward
- merge readiness
```

### Approval Step

- 重大指摘がある場合は `done` へ遷移禁止

---

## 4) 共通停止テンプレ（needs_approval）

```text
status: needs_approval
reason: {{REASON}}
linear_project: {{LINEAR_PROJECT_KEY}}
linear_issue_id: {{LINEAR_ISSUE_ID}}
plan_path: {{PLAN_PATH}}
next_action: human approval required in #auto-{{project}}-approval
```

---

## 5) チェックリスト（導入直後）

- [ ] draft plan で実行して停止する
- [ ] agreed plan で実行できる
- [ ] scope 追加要求で `needs_approval` になる
- [ ] 実行ログが `run` チャンネルに出る
- [ ] 承認待ちが `approval` チャンネルに出る
