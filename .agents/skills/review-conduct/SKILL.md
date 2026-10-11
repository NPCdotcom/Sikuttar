---
name: review-conduct
description: Review code against plan criteria, requirements, and design (V-model). Use at Check time after gathering review context.
---

# Review Conduct

**Role**: `reviewer` · **P6** · Execute

1. `review-reference`
2. **V-model**: [`../lib-review-vmodel/SKILL.md`](../lib-review-vmodel/SKILL.md) · detail [`references/v-model-rtm.md`](references/v-model-rtm.md)
3. **Outcome 確認（任意 · G13）** — plan に `outcome-check-block` がある場合: product outcome · leading indicator を Act に記録
4. Acceptance criteria — pass/fail with file:line · map each AC to a **factor** when listed
5. **Semantics checks** ([`docs/DESIGN_SEMANTICS.md`](../../docs/DESIGN_SEMANTICS.md)):
   - recognition forced into class inheritance?
   - factors omitted while only object hierarchies appear?
   - stack elevated to philosophy core?
6. 一般チェック + **rules/local/** + **AGENTS.md**
7. Verdict: pass | conditional | fail

## Report

RTM 表、criterion↔factor ごとの結果、Critical/Warning/Suggestion、spec gaps、semantics drift、巻き戻し先 P?、next actions。

## Do not

drive-by refactor、plan/design status 変更、RTM 未カバーで pass、クラス OOP 必須を新規に押し付ける

詳細パターン: [`references/standards.md`](references/standards.md)
