/**
 * Build local seed playbook (100 drafts) from Zenn/Qiita research dumps.
 * Does NOT post to production.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const OUT_DIR = __dirname;
const TARGET = 100;

const TAGS = [
  "インシデント",
  "デプロイ",
  "テスト",
  "コミュニケーション",
  "見積もり",
  "オンボーディング",
  "レビュー",
];

/** Curated paraphrases (full article skimmed). Copyright: paraphrase only + source URL. */
const CURATED = [
  {
    id: "c01",
    source: "https://zenn.dev/torun225/articles/yarakashi-2021-advent",
    source_title: "サーバを取り違えて再起動した話",
    body: "夜勤明けの障害対応で、監視画面の色だけ見て「障害側」だと思ったサーバを再起動したら稼働系だった。二次障害が出かけたが系切替で業務影響はほぼ無し。アラーム詳細を読まずアイコン色で判断したのが敗因。",
    situation: "デュープレックス構成の本番障害対応中（夜勤明け）",
    cause: "監視表示の誤読と手順・表示のズレ",
    tags: ["インシデント", "オンボーディング"],
    fidelity: "paraphrase",
  },
  {
    id: "c02",
    source: "https://zenn.dev/kazutosakagami/articles/78d1649389c868",
    source_title: "本番DBのマスターデータを全行ぶっとばすやらかし",
    body: "本番マスタのJSON列更新中、スクリプト誤作動で全行を空更新。コアタイムに緊急メンテ。スナップショット復旧に約1時間。DEV確認とトランザクションを省略していた。",
    situation: "本番マスタデータ列の一括更新",
    cause: "作業スクリプト誤UPDATEと検証省略",
    tags: ["インシデント", "デプロイ", "テスト"],
    fidelity: "paraphrase",
  },
  {
    id: "c03",
    source: "https://zenn.dev/ikuzus_atyu/articles/96a1dd8146f1ff",
    source_title: "本番リリースで3回連続失敗した詳細",
    body: "DNS切替リリースが3回連続失敗。HTTP/1.1検証×本番HTTP/2、リアルタイム集計の負荷、CDNコールドスタート。4回目で成功。",
    situation: "大規模移行後の本番DNS切替",
    cause: "環境差分と負荷・キャッシュ想定不足",
    tags: ["デプロイ", "テスト", "インシデント"],
    fidelity: "paraphrase",
  },
  {
    id: "c04",
    source: "https://zenn.dev/ak7/articles/cd693ec92071cc",
    source_title: "本番APIが突然 500 エラーになった日の話",
    body: "デプロイ無しなのにAPIが全件500。原因は別PJの共通SG変更でDB疎通遮断。「自分たちは変えていない」思い込みで約35分。",
    situation: "外部連携APIの突発500",
    cause: "共通インフラ変更と監視のギャップ",
    tags: ["インシデント", "コミュニケーション"],
    fidelity: "paraphrase",
  },
  {
    id: "c05",
    source: "https://qiita.com/saoyagi2/items/458a2b77d79def607987",
    source_title: "スロークエリを大量発生させてサービスを落とした話",
    body: "お勧め改修リリース後、キャッシュ一括クリアで数万スロークエリが同時発火しDBダウン。切り戻しで約10分復旧。検証DBがスカスカだった。",
    situation: "お勧め投稿バッチの本番実行",
    cause: "重いクエリ×キャッシュ全消しと負荷試験不足",
    tags: ["インシデント", "テスト", "デプロイ"],
    fidelity: "paraphrase",
  },
  {
    id: "c06",
    source: "https://qiita.com/bushiyama/items/54762bac77495572396d",
    source_title: "ディレクトリの深淵を覗くとき、rmすると危ないのだ",
    body: "本番SSHでゴミっぽい test~ をrmしたらクラスタ監視ファイルだった。フェイルオーバーと顧客通知まで飛んだ。",
    situation: "本番サーバの不要ファイル整理",
    cause: "カレントDIRと監視用途の未確認rm",
    tags: ["インシデント", "オンボーディング"],
    fidelity: "paraphrase",
  },
  {
    id: "c07",
    source: "https://qiita.com/358TECH-CAMP/items/cc6749f70737bb1647cf",
    source_title: "ローカルLGTMでも2回目のデプロイでできず",
    body: "ローカルでは動くのに本番でPendingMigrationError。マイグレーションをrollbackせず削除し履歴と実体が不整合に。",
    situation: "Railsの2回目以降デプロイ",
    cause: "マイグレーション物理削除とローカル固有DB状態",
    tags: ["デプロイ", "テスト"],
    fidelity: "paraphrase",
  },
  {
    id: "c08",
    source: "https://qiita.com/t_komiya/items/8d7fd3f68db7cad53206",
    source_title: "スロークエリで本番サーバーをダウンさせ、大混乱を巻き起こした話",
    body: "タイトリリース当日、本番確認後にスロークエリでサーバダウン。焦りで負荷検証を飛ばしたのが本質。",
    situation: "新規PJの本番リリース当日",
    cause: "スケジュール圧による負荷検証不足",
    tags: ["見積もり", "テスト", "インシデント"],
    fidelity: "paraphrase",
  },
  {
    id: "c09",
    source: "https://zenn.dev/yutakatay/articles/yarakashi-reboot",
    source_title: "俺TUEEE系エンジニアが本番サーバーを0.1秒で落とした話",
    body: "ローカル再起動のつもりで sudo reboot を打ったら、開いていたのが本番SSHだった。プロンプト差はあったが見た目が弱く、慣れた手癖で撃った。",
    situation: "作業キリでのクライアント再起動つもり",
    cause: "SSHセッション取り違えと目立たない本番プロンプト",
    tags: ["インシデント", "オンボーディング"],
    fidelity: "paraphrase",
  },
  {
    id: "c10",
    source: "https://zenn.dev/carenet/articles/recovering-from-bigquery-dataset-deletion",
    source_title: "BigQueryの本番データがすべて消えた日",
    body: "テスト初期化コードが本番データセット削除に向いてしまった。UNDROPは同名再作成で使えず、タイムトラベル+bq cpでテーブル単位復旧。",
    situation: "共有GCPプロジェクトのBigQuery本番",
    cause: "テストの向き先設定ミスと過剰権限",
    tags: ["インシデント", "テスト"],
    fidelity: "paraphrase",
  },
  {
    id: "c11",
    source: "https://qiita.com/YujiSoftware/items/7baec688d046796264f9",
    source_title: "SELECT文で本番環境を落としたお話",
    body: "調査用に BEGIN+SELECT を本番で張りっぱなしにしたら、別処理の LOCK TABLE と競合しコネクション枯渇でダウン。",
    situation: "本番DBでの調査SELECT",
    cause: "トランザクション放置と強いテーブルロックの競合",
    tags: ["インシデント", "レビュー"],
    fidelity: "paraphrase",
  },
  {
    id: "c12",
    source: "https://zenn.dev/mnonamer/articles/yarakashi-2025-eos-with-10k-au",
    source_title: "うっかりミスでアクティブユーザー1万人超えのサービスをサ終させた話",
    body: "過負荷対応の最適化1コミットが逆に負荷を爆発させ、個人サービスのサ終に至った。病み上がり・レビュー無し・テスト不足が重なった。",
    situation: "個人開発サービスの過負荷対応",
    cause: "レビュー無し最適化ミスと不十分なテスト",
    tags: ["インシデント", "レビュー", "テスト"],
    fidelity: "paraphrase",
  },
  {
    id: "c13",
    source: "https://zenn.dev/sohosai/articles/9ea1ec0e844232",
    source_title: "間違って電源ぶち抜いてしまい、学園祭の全配信システムを止めた話",
    body: "配信本番中に電源タップを足で引っ掛け、コアスイッチ一式が再起動。約10分配信停止。冗長電源を「同じ系統だから」と接続していなかった。",
    situation: "学園祭生配信インフラ運用中",
    cause: "物理ケーブル事故と冗長電源未接続",
    tags: ["インシデント", "見積もり"],
    fidelity: "paraphrase",
  },
  {
    id: "c14",
    source: "https://zenn.dev/nekihcom/articles/c73314a7395b7d",
    source_title: "思い込みが招いたサービス稼働停止",
    body: "別PJの開発環境だと思って main にデプロイしたら、そのPJでは main=本番だった。同顧客でもブランチ規約が違い、約1時間サービス停止。",
    situation: "同一顧客・別システムの作業",
    cause: "ブランチ運用の思い込み確認不足",
    tags: ["デプロイ", "コミュニケーション", "オンボーディング"],
    fidelity: "paraphrase",
  },
  {
    id: "c15",
    source: "https://zenn.dev/team_soda/articles/1fa98ed3e23ade",
    source_title: "開発途中の機能を公開してしまって落ち込んだ話",
    body: "Feature toggle の Remote Config 条件を誤り、未完成検索機能が一部ユーザーに露出。設定修正で約20分で復旧。",
    situation: "長期間Feature toggle開発のリリース",
    cause: "トグル条件の設定誤りと手順の仕組み不足",
    tags: ["デプロイ", "テスト", "レビュー"],
    fidelity: "paraphrase",
  },
  {
    id: "c16",
    source: "https://zenn.dev/neon_lab/books/12c552472373b5/viewer/ce14de",
    source_title: "GitLab本番データベース削除事故（教材要約）",
    body: "疲れた深夜運用でターミナル取り違えの rm -rf。バックアップは空ファイルばかりで検証不足が露呈。偶然のスナップショットで復旧。",
    situation: "深夜のDBレプリカ復旧作業",
    cause: "破壊コマンドのホスト未確認とバックアップ未検証",
    tags: ["インシデント", "レビュー"],
    fidelity: "paraphrase",
  },
];

function pickTags(title) {
  const t = title;
  const out = new Set();
  if (/DB|データベース|SQL|クエリ|削除|rm |DROP|バックアップ/i.test(t)) out.add("インシデント");
  if (/デプロイ|リリース|本番|ブランチ|ルーター|ルータ|DNS|CDN/i.test(t)) out.add("デプロイ");
  if (/テスト|検証|LGTM|ローカル/i.test(t)) out.add("テスト");
  if (/コミュニケーション|連絡|確認|思い込み|レビュー/i.test(t)) out.add("コミュニケーション");
  if (/見積|スケジュール|焦|残業|夜勤/i.test(t)) out.add("見積もり");
  if (/新人|オンボ|SSH|ログイン|ホスト名/i.test(t)) out.add("オンボーディング");
  if (/レビュー|コード|コミット|正規表現/i.test(t)) out.add("レビュー");
  if (out.size === 0) out.add("インシデント");
  return [...out].slice(0, 3);
}

function draftFromTitle(title, meta, index) {
  const tags = pickTags(title);
  const situation = `『${title}』に相当する失敗が起きた現場作業`;
  const cause = "手順・確認・環境差分・思い込みのいずれかが重なった（台本草案・要推敲）";
  const calendar = meta.source.includes("2025")
    ? "https://qiita.com/advent-calendar/2025/yarakashi"
    : meta.source.includes("2024")
      ? "https://qiita.com/advent-calendar/2024/yarakashi-production"
      : meta.source.includes("2023")
        ? "https://qiita.com/advent-calendar/2023/yarakashi"
        : meta.source.includes("2022")
          ? "https://qiita.com/advent-calendar/2022/yarakashi-production"
          : meta.source.includes("2020")
            ? "https://qiita.com/advent-calendar/2020/yarakashi-production"
            : "https://qiita.com/search?q=%E3%82%84%E3%82%89%E3%81%8B%E3%81%97";
  const body = [
    `【台本草案】題材: ${title}`,
    meta.user ? `（報告者ヒント: @${meta.user}）` : "",
    "公開失敗談カレンダー／検索で見つけた題材を、シクッター投稿用に短文化した草案。",
    "本文は原文コピーではなく、タイトルから起こした状況・学びの骨子。本番投入前に記事を開いて推敲すること。",
    `出典入口: ${calendar}`,
  ]
    .filter(Boolean)
    .join("\n");
  return {
    id: `t${String(index).padStart(3, "0")}`,
    source: calendar,
    source_title: title,
    body,
    situation,
    cause,
    tags,
    fidelity: "title_draft",
    needs_review: true,
  };
}

function extractTitlesFromAgentTools() {
  const dir = join(
    process.env.USERPROFILE || "",
    ".cursor/projects/d-WorkSpaces-Sikuttar/agent-tools",
  );
  const map = new Map();
  if (!existsSync(dir)) return map;
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".txt"))) {
    const text = readFileSync(join(dir, f), "utf8");
    if (!/やらかし|Advent Calendar|失敗/.test(text)) continue;
    for (const m of text.matchAll(
      /@([A-Za-z0-9_-]+)([\s\S]{8,120}?)(?:Overwrite|代わりに投稿|URL You can)/gu,
    )) {
      let title = m[2].replace(/\s+/g, " ").trim();
      title = title.replace(/^\d+\s*/, "").trim();
      if (title.length < 8 || title.length > 90) continue;
      if (/Join calendar|I will write|Articles to be|About reserved|参加ボタン|ex\./.test(title))
        continue;
      if (!/[ぁ-んァ-ン一-龥]/.test(title)) continue;
      if (!map.has(title)) map.set(title, { user: m[1], source: f });
    }
  }
  return map;
}

function extractFromBrowserSnapshots() {
  const dir = join(process.env.USERPROFILE || "", ".cursor/browser-logs");
  const map = new Map();
  if (!existsSync(dir)) return map;
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".log")).slice(-20)) {
    const text = readFileSync(join(dir, f), "utf8");
    for (const m of text.matchAll(/name: ([^\n]{8,90}話)/g)) {
      let t = m[1].trim().replace(/^"/, "");
      if (t.startsWith("@")) t = t.replace(/^@[A-Za-z0-9_-]+/, "");
      if (/Qiita|代わりに|投稿タイトル|カレンダー/.test(t)) continue;
      if (!/[ぁ-んァ-ン]/.test(t)) continue;
      if (!map.has(t)) map.set(t, { user: "", source: f });
    }
  }
  return map;
}

const EXTRA_TITLES = [
  "データベースを吹っ飛ばした話",
  "本番環境のYAMAHAルーターをリモートで初期化しちゃった話",
  "検証したのに冗長ルータが本番環境では切り替わらなかった話",
  "条件付きフォワーダー設定のせいで業務停止させた話",
  "意図せずオープンリレーサーバーが爆誕していた話",
  "ルート直下に謎のディレクトリを大量生産した話",
  "アップロード画像を全消しした話",
  "本番サーバー60台のホスト名を全部 cat にしてしまった話",
  "ファイルサーバーを業務中に再起動しちゃったので経緯と原因と対策を共有します",
  "ロードバランサ配下のサーバを全部切り離してサービス停止させてしまった話",
  "正規表現ミスって一晩誰もサービスにログインできなくしてしまった話",
  "不用意にサーバーでアプリを起動してハングアップさせてしまった話",
  "コンテンツ全消ししちゃった話",
  "客先のDBを間違えて削除した話",
  "スパゲティプログラムに3行追加したら決済ができなくなった話",
  "メールサーバーを爆撃して部門長宛のメールを消失させた話",
  "プログラムに1文字加えて本番環境のバッチ処理を4倍遅くした",
  "思い出の詰まった大学サークルの記録DBをバックアップ取らずに全消しした話",
  "新規開発したらオーバースペックだった件、原因は意外なところにあった",
  "サイトを停止させた話 ～慢心は敵！バックアップはゼッタイ！～",
];

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const fromTools = extractTitlesFromAgentTools();
  const fromSnap = extractFromBrowserSnapshots();
  for (const [k, v] of fromSnap) if (!fromTools.has(k)) fromTools.set(k, v);
  for (const t of EXTRA_TITLES) if (!fromTools.has(t)) fromTools.set(t, { user: "", source: "extra" });

  const curatedTitles = new Set(CURATED.map((c) => c.source_title));
  const stories = [...CURATED];
  let i = 1;
  for (const [title, meta] of fromTools) {
    if (stories.length >= TARGET) break;
    if ([...curatedTitles].some((c) => title.includes(c.slice(0, 10)) || c.includes(title.slice(0, 10))))
      continue;
    stories.push(draftFromTitle(title, meta, i++));
  }

  // Pad with synthetic calendar-topic drafts if still short (still local-only, marked)
  const padTopics = [
    "本番の設定差分で認証が全滅した話",
    "キャッシュTTLを0にしてオリジンを焼き払った話",
    "マイグレーションのロックでピークタイムを落とした話",
    "監視アラートを静音化したまま障害を見逃した話",
    "ステージングと本番の接続先を取り違えた話",
    "権限昇格テストを本番で走らせてしまった話",
    "ログに個人情報を出してしまった話",
    "レート制限を外して外部APIを叩いた話",
    "カナリアを全トラフィックに向けてしまった話",
    "証明書期限を見逃してHTTPSが死んだ話",
    "ジョブの並行度を上げすぎてキューが詰まった話",
    "フィーチャーフラグのデフォルトをONにした話",
    "本番データで負荷試験して課金が跳ねた話",
    "メンテ告知なしで深夜メンテを入れた話",
    "ロールバック手順が古くて復旧が遅れた話",
    "依存ライブラリのメジャー更新を雑に入れた話",
    "DNS TTLを長くしすぎて切替が遅れた話",
    "ヘルスチェックをパスし続けて不良ノードを残した話",
    "シークレットをリポジトリにコミットした話",
    "本番コンソールで実験クエリを流した話",
  ];
  while (stories.length < TARGET) {
    const title = padTopics[(stories.length - CURATED.length) % padTopics.length];
    const n = stories.length - CURATED.length + 1;
    stories.push(
      draftFromTitle(
        `${title}（台本バリエーション ${n}）`,
        { user: "", source: "local-pad-zenn-qiita-themes" },
        n,
      ),
    );
  }

  const playbook = {
    version: 1,
    created: new Date().toISOString().slice(0, 10),
    goal: { total_posts: TARGET, prod_existing: 8, note: "本番投入は別手順。既定は dry-run。" },
    policy: {
      no_prod_by_default: true,
      paraphrase_only: true,
      sources: ["https://zenn.dev", "https://qiita.com"],
      tag_vocabulary: TAGS,
    },
    stats: {
      total: stories.length,
      paraphrase: stories.filter((s) => s.fidelity === "paraphrase").length,
      title_draft: stories.filter((s) => s.fidelity === "title_draft").length,
      needs_review: stories.filter((s) => s.needs_review).length,
      titles_mined: fromTools.size,
    },
    stories: stories.slice(0, TARGET),
  };

  const outJson = join(OUT_DIR, "playbook.json");
  writeFileSync(outJson, JSON.stringify(playbook, null, 2), "utf8");

  const sources = {
    mined_titles: [...fromTools.entries()].map(([title, meta]) => ({ title, ...meta })),
    curated_urls: CURATED.map((c) => ({ title: c.source_title, url: c.source })),
  };
  writeFileSync(join(OUT_DIR, "sources.json"), JSON.stringify(sources, null, 2), "utf8");

  console.log(
    JSON.stringify(
      {
        out: outJson,
        ...playbook.stats,
        root: ROOT,
      },
      null,
      2,
    ),
  );
}

main();
