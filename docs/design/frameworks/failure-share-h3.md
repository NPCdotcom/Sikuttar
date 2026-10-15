---
title: H3 フレームワーク概要 — failure-share（S1）
kind: design
phase: P3
scope_level: H3
status: agreed
agreed_at: "2026-10-15"
related_product: docs/design/product/charter.md
related_h2: docs/design/systems/failure-share-h2.md
related_requirements: docs/requirements/failure-share/要件.md
structure_ref: "charter §7 stack as means · supports SYS1/SYS2 · not product taxonomy"
created: "2026-10-15"
updated: "2026-10-15"
---

# H3 フレームワーク概要 — failure-share（S1）

Semantics: [.agents/docs/DESIGN_SEMANTICS.md](../../../.agents/docs/DESIGN_SEMANTICS.md)  
親 H2: [failure-share-h2](../systems/failure-share-h2.md)（agreed）  
手段 Assumption（charter §7）: TypeScript · React · Hono · Cloudflare

> **構造ルール**: H3 は **手段（フレームワーク／ランタイム）**。製品認識（失敗談・フィード等）の別名にしない。SYS1/SYS2 の因子を載せる器として選ぶ。

## 目的

S1（投稿→永続化→匿名一覧）と S2（限定リアクション）を動かす最小フレームワークセットを固定する。

## Recognition（フレームワーク単位 · 手段）

| ID | フレームワーク | 一文 | 主に支える H2 |
|----|----------------|------|----------------|
| FW1 | Web UI（React） | 投稿・フィード・リアクション・関連展開 | SYS1–SYS4 表示／入力 |
| FW2 | HTTP API（Hono） | 投稿・一覧・リアクション・関連照会の境界 | SYS1–SYS4 |
| FW3 | エッジ実行基盤（Cloudflare） | ホスト · Store · セッション相当 | 永続化 · authorKey · D1 類似 |

言語 TypeScript は FW1–FW3 共通の記述手段（単独の「製品要素」にはしない）。

## 個別設計

| FW | パス |
|----|------|
| FW1 React UI | [react-ui.md](react-ui.md) |
| FW2 Hono API | [hono-api.md](hono-api.md) |
| FW3 Cloudflare 基盤 | [cloudflare-platform.md](cloudflare-platform.md) |

## 配置関係（論理）

```text
[Browser · FW1 React]
        │  HTTPS
        ▼
[FW2 Hono on FW3 Workers]
        │
        ├─ POST 失敗談 → SYS1 factors → Store (FW3)
        ├─ GET  一覧   → SYS2+SYS3 → anonymize + public counts → JSON
        ├─ POST リアクション → SYS3 factors → Store (FW3)
        └─ GET  関連   → SYS4 findRelatedStories → JSON
```

## Factors（枠に載せるもの · 製品因子は H1/H2 正本）

| 枠 | 載せる因子（参照） |
|----|-------------------|
| FW1 | 投稿 · 一覧 · わかる／参考になる · 関連を展開する |
| FW2 | validate · list · anonymize · reactions · findRelatedStories |
| FW3 | 永続化 · authorKey · reactions · D1 走査（後段 Vectorize 差し替え可） |

## 境界・非目的

- **含む**: S1–S3 を動かす FW1–FW3
- **含まない**: Vectorize 本接続の必須化 · 優先度ライブラリ本採用 · 本格 Auth SaaS · BAD 公開 UI
- **しない**: 「React コンポーネント階層 = 製品オブジェクト階層」への短絡

## エージェント提案

| 案 | 概要 | 推奨 |
|----|------|------|
| A | charter Assumption どおり React + Hono + Cloudflare | **推奨** — 検証コスト低 |
| B | Next 全載せ等に寄せて BFF を一体化 | 速いが境界が濁りやすい |
| C | 今はフレームワーク未定のまま P4 | 実装着手が遅れる |

**推奨: A**

## ユーザー思考

> 良いと思います。H3 個別設計まで行いましょう。

## Open questions

- [x] FW1–FW3 分割（React / Hono / Cloudflare）でよいか → **yes**
- Store 製品名（D1 / KV / DO 等）→ FW3 内で選択肢 · 仮決め可

## 次

- [x] ユーザー確認 → H3 agreed
- [ ] P4: SYS1/SYS2 × FW の program/plan
