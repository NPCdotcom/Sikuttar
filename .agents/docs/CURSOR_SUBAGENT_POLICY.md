# Cursor Subagent · 並列実行の境界方針

**ステータス**: 正本（2026-10-11 · 読取専用調査を許可 · ユーザー Go）  
**因子**: `prop.kit.no_subagent` — 性質の所有者は [no-subagents.mdc](../rules/no-subagents.mdc)。本書はその **理由（認識）** を所有する。  
**関連**: [CURSOR_AGENT_TOOLING.md](./CURSOR_AGENT_TOOLING.md) · [ROLES_AND_GOVERNANCE.md](./ROLES_AND_GOVERNANCE.md)

本キットは **単一 PM エージェント + secretary オーケストレーション** を前提とする。Cursor が提供する並列・委譲機能のうち、何を使い、何を使わないかをここで固定する。

---

## 原則

| 層 | 役割 | 本キット |
|----|------|----------|
| **Orchestration** | 工程 · ゲート · skill ルーティング | secretary · `role-execute` |
| **Execution** | 編集 · Shell · MCP | Cursor Agent / Plan / Debug |
| **Governance** | HITL · 決定的ブロック | Gate Keeper · hooks（任意）· Auto-review |

**AI-DLC の Mob** は「全員同室で AI を検証する」儀式である。1-user エージェントキットでは **ユーザー + PM + 同期ターン** で抽象化する。物理的な Subagent 並列は **Mob の代替ではない**。

読取専用の調査だけを Subagent に逃がすのは、メインコンテキスト（エコプロンプト）を節約するためである。書込・実行・ゲート判断は常に PM に残す。

---

## 機能別判定

| Cursor 機能 | 方針 | 理由 | 代替 / 条件 |
|-------------|------|------|-------------|
| **Task / Subagent（書込・実行・ゲート）** | **禁止** | 二重オーケストレーション · 監査単純化 · `prop.kit.no_subagent` | `role-execute` 直列 · PM が skill 実行 |
| **Task / Subagent（読取専用調査）** | **許可** | メインコンテキストを消費しない探索 | 許可条件 3 点（下節）をすべて満たすこと |
| **Explore subagent**（製品内蔵） | **許可** | 読取専用探索と同型 | 結果は PM が要約統合 |
| **Cloud Background Agent** | **キット外** | 非同期 · 別 VM · session 外 HITL | Operations 候補 · 明示依頼時のみユーザー判断 |
| **Plan モード** | **推奨** | Workflow Planning の UI 相当 | P4 前 · adaptive-lifecycle-plan 入力 |
| **Ask モード** | **推奨** | Inception 調査 · 読取専用 | P0–P3 · P6 分析 |
| **Agent モード** | **推奨** | Construction 実行 | P5 · `implement-conduct` スコープ内 |
| **Debug モード** | **推奨** | Build/Test 失敗ループ | P5–P6 |
| **hooks `subagentStart`** | **任意** | 書込系 Task をブロックする用途に限定可 | `.cursor/hooks.json` テンプレは学習層 `experiments/` |

---

## 許可条件（読取専用 Subagent）

次の **3 点すべて** を満たすときだけ Subagent を起動してよい。

1. **書込なし** — リポジトリ / `.agents/memory` / nav / project-state を変更しない  
2. **実行なし** — デプロイ · 破壊的 Shell · ゲート決定 · role-execute 列の代理実行をしない  
3. **結果は要約で返る** — PM が同一チャットで統合する。brief / nav への書込は PM のみ

例（許可）: コード/ドキュメント探索 · CI 失敗ログの読取調査 · 製品ドキュメント参照。  
例（禁止）: ファイル編集 · コミット · plan/Do の実行 · Hermes MCP。

---

## Cloud Agent との関係

Cloud Agent はリポジトリの `.cursor/hooks.json` を実行する（[Cursor hooks ドキュメント](https://cursor.com/docs/agent/hooks)）。キット標準ワークフロー（P4 `agreed` plan → P5 implement → P6 review）の **代替にはしない**。

| 用途 | キット内 | キット外（ユーザー裁量） |
|------|----------|--------------------------|
| 単一 plan の完走 | **正** | — |
| 非同期 PR · 長時間調査 | 非推奨 | ユーザーが明示依頼した場合 |
| Operations（デプロイ監視） | `docs/_template/operations/` → 利用先 `docs/operations/` | Cloud BG はキット外（別 WF） |

---

## プロジェクト固有オーバーライド

キット既定より緩い（または厳しい）ポリシーが必要な場合は、利用先プロジェクトの `AGENTS.md` で **キット外の明示的オーバーライド** を記載し、本キットの secretary ループとは **別ワークフロー** として扱う。

---

## 昇格履歴

| 日付 | 由来 |
|------|------|
| 2026-06-22 | `s-01-kit-gap` G5 · ユーザー確認後 `docs/` 昇格（全面禁止） |
| 2026-10-11 | 読取専用調査のみ許可（エコプロンプト: メインコンテキストを消費しない調査の委譲）· id `prop.kit.no_subagent` 維持 |
