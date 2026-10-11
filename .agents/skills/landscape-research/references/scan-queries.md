# Landscape research — scan query patterns

**Phase 1**: 1 axis = 1 query · **broad** · 年号入れ可（2024 2025 2026）

## 軸の切り方（Frame）

| 軸タイプ | 例 |
|----------|-----|
| 問題域 | `{topic} LLM agent challenges survey` |
| 機構 | `{topic} architecture memory evaluation` |
| 比較 | `{A} vs {B} agent design` |
| ベンチマーク | `{topic} benchmark arxiv` |
| 実装 | `{topic} best practices IDE cursor` |
| リスク | `{topic} failure mode confabulation agent` |
| 運用 | `{topic} production governance` |

## 設計意味論クラスタ（任意 · W4）

アーキ / エンジン / シミュレーション系の問いでは、Frame に **1–2 軸以上** を混ぜる（全部必須ではない）。  
ポリシー: `docs/LANDSCAPE_RESEARCH_POLICY.md` §既定クラスタ · `docs/DESIGN_SEMANTICS.md`

| クラスタ | クエリ例 |
|----------|----------|
| **C-factor** | `{topic} plugin registry OR kernel registration OR open-closed` |
| **C-message** | `{topic} message driven OR event sourcing OR ECS OR actor model` |
| **C-recognition** | `{topic} domain ontology OR kind registry OR "data oriented" design`（class hierarchy 一択にしない） |
| **C-stack** | `{topic} Rust safety OR FFI OR CUDA Vulkan`（**手段**として。必須化しない） |

```
# 因子登録寄り
{topic} extensible via registration OR plugin architecture survey

# メッセージ / 合成寄り
{topic} composition over inheritance OR behavior composition

# 認識≠class（ズレ確認用）
"{topic}" OOP inheritance vs registry OR ECS
```

## クエリ型

```
# 広域 survey
{topic} survey OR benchmark OR framework 2024 2025

# Named approach（第2波の hook 候補探し）
{topic} Reflexion OR Self-RAG OR "agent memory"

# 実務
{topic} implementation lessons learned
```

## 並列数

| 問いの規模 | Scan 並列 |
|------------|-----------|
| 小（1 決定） | 4 |
| 中（設計章） | 5–6 |
| 大（キット方針） | 6–7 |

## Drill クエリ（Phase 3）

```
"{PaperOrFrameworkName}" {key mechanism}
site:arxiv.org OR site:github.com  # 任意
```

Drill は **Cluster で選んだ 2–4 hooks のみ**。

## 禁止

- 第1波で `{用語} 定義` のみ（→ terminology-research）
- 同一クエリの使い回し（軸が被る）
