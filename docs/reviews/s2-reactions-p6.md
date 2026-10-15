---
title: P6 review — S2 limited reactions + BAD internal
kind: review
phase: P6
slice: S2
status: agreed
agreed_at: "2026-10-15"
verdict: go
created: "2026-10-15"
updated: "2026-10-15"
related_requirements: docs/requirements/failure-share/要件.md
related_design: docs/design/systems/reaction-signaling.md
---

# P6 — S2 リアクション／BAD 内部記録

## Verdict

**Go**（ユーザー承認 2026-10-15 · FR5–FR7 充足 · 公開面に BAD なし）

## V-model

| Layer | Check | Result |
|-------|-------|--------|
| **UT** | validateReactionKind · maskBadFromPublic · existing factors | **pass**（`npm test` 8 tests） |
| **IT** | migration `0003_reactions` · POST `/stories/:id/reactions` · GET counts | **pass**（live: wakaru/reference/bad 201 · duplicate 409 · counts に bad なし） |
| **ST** | SYS3 · E3/E4 · FW1/FW2 追記とコード配置一致 | **pass** |
| **UAT** | FR5–FR7 | **pass**（下記） |

## Requirements trace

| ID | Evidence | Result |
|----|----------|--------|
| FR5 | UI 2種 · `validateReactionKind` · POST reactions | pass |
| FR6 | コメント入力 UI/API なし | pass |
| FR7 | `countPublicReactions` が bad 除外 · UI に BAD なし · 内部 kind=bad 受付可 | pass |
| NFR3 | factors 分離（validate / persist / count / mask） | pass |

## Artifacts

| Kind | Path |
|------|------|
| Design | `docs/design/elements/limited-reaction.md` · `bad-signal.md` · `systems/reaction-signaling.md` |
| Plans | `.agents/plans/programs/ui-reactions-on-feed.md` · `algorithms/persist-reaction.md` · `count-public-reactions.md` |
| Code | `migrations/0003_reactions.sql` · `src/factors/*Reaction*` · `src/index.ts` · `apps/web/src/App.tsx` |
| Branch | `plan/s2-reactions` |

## Warnings

- リアクション取り消し（toggle off）は未実装（Open · 非ブロッカー）
- BAD 付与の権限／管理 UI は後段
- 手動ブラウザ IT（わかる→件数増）はローカル起動で確認推奨

## Gate

| Decision | Recorded |
|----------|----------|
| **Go** | 2026-10-15 · `P6-s2-reactions-go` |
