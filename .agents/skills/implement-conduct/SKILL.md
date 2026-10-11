---
name: implement-conduct
description: Implement the agreed plan with TDD and minimal diffs. Use when coding features or fixes inside plan scope.
---

# Implement Conduct

**Role**: `builder` · **P5** · Execute

**Prerequisite**: `implement-reference` complete; ready for Do = yes.

## Unit of work

Default **Do unit** = one **factor** (function · action · property) or the smallest combination that still tests cleanly — matching plan Factors / AC.  
Not “one class”. Semantics: [`docs/DESIGN_SEMANTICS.md`](../../docs/DESIGN_SEMANTICS.md).

## Workflow

1. Acceptance criteria **1 件ずつ**（各 AC は因子に対応）→ ファイル対応
2. **TDD**: follow [`../lib-tdd-cycle/SKILL.md`](../lib-tdd-cycle/SKILL.md) — Red expresses **one factor criterion**
3. **AGENTS.md** + **rules/local/** implement lens
4. 既存命名・型に合わせ、diff 最小。登録／組み合わせで足せるなら class 階層を増やさない

## Checklist

- 変更は plan Scope / criterion / **factor** にトレース
- Design Facts 尊重；Assumptions を Fact 扱いしない
- secrets / debug 残しなし
- Recognition（仕様上のオブジェクト）をコード class に無理押ししていない

## Gaps

- spec gap → stop → **spec_designer**
- plan gap → stop → **plan_slicer**

## After

**reviewer** 向け: files、criteria↔factor mapping、検証手順。

## Do not

ユーザー未依頼の full review、design/plan 直編（`implement-record` 経由のみ）、クラス階層必須化

詳細: [`references/standards.md`](references/standards.md)
