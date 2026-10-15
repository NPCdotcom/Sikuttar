---
title: H3 フレームワーク — Web UI（React）· FW1
kind: design
phase: P3
scope_level: H3
status: agreed
agreed_at: "2026-10-15"
framework_id: FW1
slice: S1
related_h3: docs/design/frameworks/failure-share-h3.md
related_systems:
  - docs/design/systems/story-posting.md
  - docs/design/systems/feed-reading.md
created: "2026-10-15"
updated: "2026-10-15"
---

# Framework — Web UI（React）· FW1

親: [failure-share-h3](failure-share-h3.md)  
支える: SYS1 入力面 · SYS2 表示面  
Assumption: TypeScript · React（charter §7）

## 目的

ブラウザで「投稿する」「一覧を描画する」を提供する。製品認識は失敗談／フィードであり、React は描画手段。

## Recognition

| 認識単位 | 一文 |
|----------|------|
| Web UI 枠 | 投稿フォームとフィード一覧のブラウザ面 |

コンポーネント名を製品オブジェクトの正本にしない（例: `PostCard` は実装便宜）。

## Factors（UI に載せる）

| 因子 | 種別 | メモ |
|------|------|------|
| 投稿フォームを出す | action | body 必須 · situation?/cause? 任意 |
| 投稿を送る | action | FW2 API へ |
| フィードを描画する | action | 匿名化済み項目のみ表示 |
| 身元ラベルを出さない | property | authorKey 等を描画しない（E8） |

## モジュール境界

```text
<App>
  <StoryComposeForm />  → POST /stories (FW2)
  <FailureFeed />       → GET  /stories (FW2) → render items without identity
```

状態は最小（フォーム local state + 一覧 fetch）。グローバル store 必須にしない。

## 境界・非目的

- **含む**: S1 の投稿・一覧 UI · S2 の限定リアクション · S3 の「関連する失敗談」展開
- **含まない**: ログイン画面 · コメントスレ · BAD 公開ボタン · SSR 必須化

## エージェント提案

| 案 | 概要 | 推奨 |
|----|------|------|
| A | Vite + React SPA · API は別オリジン/同ドメイン Workers | **推奨** — 境界が明確 |
| B | React を Cloudflare 上のフルスタック枠に密結合 | 初期は速いが FW 境界が溶けやすい |
| C | 素の HTML のみ | 最短だが後の拡張がつらい |

**推奨: A**

## Open questions

- [x] Vite + React SPA でよいか → **yes**
- ルーティング（単一ページで十分か）→ P4 で仮決め可

## 次

- [x] 合意 → agreed
- [ ] P4: compose / feed の program
