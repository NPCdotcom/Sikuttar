---
title: Terminology alignment — P1 failure-share
kind: glossary
phase: P1
status: agreed
agreed_at: "2026-10-15"
related_requirement: docs/requirements/failure-share/要求.md
created: "2026-10-12"
updated: "2026-10-18"
---

# Terminology alignment（外部調査）— P1 failure-share

| 用語 | 層（認識/因子/スタック/工程） | 本プロジェクトでの定義（案） | 外部の一般定義（要約） | ソース |
|------|-------------------------------|------------------------------|------------------------|--------|
| 要求（stakeholder needs） | 工程 | 利用者・共同者が「何を得たいか」の言語化。検証可能な実装条件はまだ書かない（→ P2 要件） | Stakeholder needs / requirements: 環境との意図した相互作用を表す利用者視点の必要能力 | [SEBoK Stakeholder Needs Definition](https://sebokwiki.org/wiki/Stakeholder_Needs_Definition) · ISO/IEC/IEEE 15288 |
| 要件（system requirements） | 工程 | 要求を満たすためにシステムが持つべき検証可能な特性（P2）。実装手段はまだ固定しない | System requirements: ステークホルダー視点を供給者視点の技術要件へ変換した測定可能な記述 | [SEBoK System Requirements Definition](https://sebokwiki.org/wiki/System_Requirements_Definition) |
| 心理安全性 | 認識（体験品質） | ダメ出し・晒しを恐れず失敗談を書けると感じられる状態。限定リアクション・BAD 非可視化で支える | Team psychological safety: 対人リスクを取っても罰されないという共有信念（Edmondson） | [Edmondson 1999 PDF](https://web.mit.edu/curhan/www/docs/Articles/15341_Readings/Group_Performance/Edmondson%20Psychological%20safety.pdf) |
| 集合知 | 認識（価値） | 個々の失敗談の集積から得られる、共有可能な学び・行動改善の手がかり | Collective intelligence: 協力や情報集約により個人より効果的に問題を解く／知識を生む集団の能力 | [Wikipedia: Collective intelligence](https://en.wikipedia.org/wiki/Collective_intelligence) |
| ベイズ平均 | 因子（表示優先度） | 反応が少ない投稿を全体平均寄りに平滑化する枠組み。式・係数は要件以降 | Sparse ratings を prior（疑似票）で平滑化し、極端な初期スコアを抑える ranking 手法 | [Evan Miller — Bayesian Average Ratings](https://www.evanmiller.org/bayesian-average-ratings.html) |
| RAG | 因子（後段提示）・スタック手段 | 蓄積失敗談の検索・類似提示。MVP 必須ではない。生成より「関連失敗の提示」が当面の価値 | Retrieval-Augmented Generation: 検索した非パラメトリック記憶を生成に条件付ける手法（Lewis et al. 2020） | [arXiv:2005.11401](https://arxiv.org/abs/2005.11401) |
| 匿名表示 | 認識（表示方針） | 画面上は身元を出さない。職業等の属性は内部保持しうる | （製品方針）表示上の匿名とアカウント属性の分離 | charter §4 |
| オブジェクト | 認識 | 仕様上の包含・分類単位（≠ コードの class） | キット意味論: recognition unit | [DESIGN_SEMANTICS.md](../../.agents/docs/DESIGN_SEMANTICS.md) |
| 意味検索 | 認識（E9） | クエリ埋め込み＋ベクトル近傍で失敗談を返す。未設定時は D1 フォールバック | Vector search / semantic retrieval | [Vectorize pricing](https://developers.cloudflare.com/vectorize/platform/pricing/) |
| 分類タグ | 認識（E10） | 失敗談の索引ラベル（通称ハッシュタグ）。炎上話題タグではなく学びの類型 | Hashtag / taxonomy label（製品では分類に限定） | wave2 要求 |
| 個人保存 | 認識（E11） | 認証利用者の非公開ブックマーク | Bookmark / save-for-later | wave2 要求 |
| 持続アカウント紐づけ | 認識（E7′） | 認証 subject を accounts 行に結ぶ。公開プロフィールは作らない | Account linking / federated identity | wave2 要求 |
| 秘書照会 | 認識（E12） | 蓄積失敗談に基づく短い助言＋根拠。v1 はテンプレ応答（生成 LLM なし） | Advice / RAG-style Q&A face（製品はテンプレ優先） | [要求-secretary](../requirements/failure-share/要求-secretary.md) · ADR 0002 |

### ズレ・リスク

- 「要求」と「要件」を同一視すると、P1 で検証条件や式まで書き過ぎる
- RAG を「必ず LLM 生成」と読むと MVP スコープが膨らむ（類似提示は段階導入 · 秘書 E12 も v1 はテンプレ）
- 心理安全性を「ネガティブ反応ゼロ」と厳密化するとモデレーション設計が肥大化する

### 推奨（おすすめ 1）

- P1 は stakeholder needs のみ。検証条件・重み係数・式は P2。RAG は後段 should/could。

### ユーザー確認

- [x] 上記定義で進めてよいか（2026-10-15 · 要求 agreed に含む）
