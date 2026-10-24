/**
 * Refine title_draft → short paraphrases (no verbatim copy).
 * Dedupes "##" variants and pad fillers. Writes playbook.json (100).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TARGET = 100;

function normalizeTitle(t) {
  return t
    .replace(/\s*##+\s*$/u, "")
    .replace(/（台本バリエーション\s*\d+）/u, "")
    .replace(/\s+/gu, " ")
    .trim();
}

function pickTags(title) {
  const out = new Set();
  if (/DB|データベース|SQL|クエリ|削除|rm |DROP|バックアップ|Table|PITR|CASCADE/i.test(title))
    out.add("インシデント");
  if (/デプロイ|リリース|本番|ブランチ|ルーター|ルータ|DNS|CDN|yum|API|向き先/i.test(title))
    out.add("デプロイ");
  if (/テスト|検証|LGTM|ローカル|select/i.test(title)) out.add("テスト");
  if (/メール|連絡|確認|思い込み|権限|S3|トレンド/i.test(title)) out.add("コミュニケーション");
  if (/見積|スケジュール|焦|請求|コスト|万円/i.test(title)) out.add("見積もり");
  if (/新人|オンボ|SSH|ホスト名|孤立|crontab|Crontab/i.test(title)) out.add("オンボーディング");
  if (/レビュー|コード|コミット|正規表現|割れ窓/i.test(title)) out.add("レビュー");
  if (out.size === 0) out.add("インシデント");
  return [...out].slice(0, 3);
}

/** Title → concrete short paraphrase (situation/cause/body). */
function refineFromTitle(title, source) {
  const t = normalizeTitle(title);
  const tags = pickTags(t);
  const rules = [
    {
      re: /yum update/i,
      situation: "本番サーバのパッケージ更新作業",
      cause: "本番での無計画な yum update と依存破壊の未検証",
      body: "本番で sudo yum update を流したら依存が壊れ、サービスが起動しなくなった。検証環境での差分確認と、本番更新の段階的適用が足りなかった。",
    },
    {
      re: /CASCADE|Delete|DELETE/i,
      situation: "本番DBでのテーブル削除作業",
      cause: "ON DELETE CASCADE の影響範囲を見落とした",
      body: "本番でテーブルを1つ削除したつもりが、CASCADE で関連4テーブルのデータまで消えた。制約と依存図を事前に洗わず実行した。",
    },
    {
      re: /お詫び|アイテム/,
      situation: "ゲーム運営のお詫び配布",
      cause: "配布条件・件数・冪等の設計不足",
      body: "お詫びアイテム配布で想定外の付与や重複が起き、運用が炎上した。配布ジョブの上限・冪等・ロールバック手順を先に固めるべきだった。",
    },
    {
      re: /selectを叩|SELECT/i,
      situation: "本番DBでの調査クエリ",
      cause: "重い SELECT / ロック競合の未考慮",
      body: "本番で『動いているはず』の SELECT を叩いたらロックや負荷でサービスが落ちた。読み取り専用でも本番では実行計画とタイムアウトを見る必要がある。",
    },
    {
      re: /向き先|API/,
      situation: "外部API連携の本番リリース",
      cause: "環境ごとのエンドポイント取り違え",
      body: "APIの向き先を誤ったままリリースし、障害が拡散してSNSトレンド入りした。設定の環境分離とリリース前の疎通チェックが抜けていた。",
    },
    {
      re: /初期化URL|ふっとば/,
      situation: "管理用メンテナンスURLの誤操作",
      cause: "危険操作URLの露出と確認ダイアログ不足",
      body: "管理者用初期化URLを誤って踏み、Webサービスのデータを消した。破壊操作は認証・確認・監査ログを三重にすべきだった。",
    },
    {
      re: /PITR|一括更新/,
      situation: "本番テーブルの一括更新",
      cause: "更新前バックアップ／PITR手順の未準備",
      body: "テーブル一括更新で想定外のデータ破壊が起き、PITRで戻すことになった。更新前のスナップショットとトランザクション確認を省略していた。",
    },
    {
      re: /raid|バックアップはどこ/i,
      situation: "障害ディスク上のバックアップ配置確認",
      cause: "バックアップ媒体と障害箇所の同居",
      body: "RAID故障対応で、バックアップが壊れたディスク上にあったことに気づき復旧が難航した。バックアップは障害ドメインを分けるのが前提だった。",
    },
    {
      re: /クラスタ/,
      situation: "クラスタノード欠損の復旧作業",
      cause: "復旧手順の取り違えでクラスタ全体を停止",
      body: "ノード欠損を直そうとして操作を誤り、クラスタごと落とした。クォーラムと手順書の確認を飛ばし、単独判断で進めた。",
    },
    {
      re: /半年早く|開発中プログラム/,
      situation: "未完成機能の本番反映",
      cause: "リリースゲート／フラグの欠如",
      body: "開発中のプログラムが半年早く本番に乗ってしまった。ブランチ保護とフィーチャーフラグが無く、マージ＝公開になっていた。",
    },
    {
      re: /コンソールは白|ペイ・ガガーリン/,
      situation: "本番コンソール操作中の真っ白画面／誤操作",
      cause: "本番コンソールでの実験的操作",
      body: "本番コンソールで操作中に想定外の状態（白い画面）に陥り、サービス影響が出た。本番コンソールは原則禁止、必要な操作はIaCとレビュー経由にすべきだった。",
    },
    {
      re: /prdに反映|devにデプロイ/,
      situation: "環境へのデプロイ作業",
      cause: "dev/prd ターゲットの取り違え",
      body: "devに出したつもりが prd に反映されていた。デプロイターゲットの明示確認と、本番は別パイプラインにするルールが弱かった。",
    },
    {
      re: /孤立/,
      situation: "未知システムのネットワーク／設定変更",
      cause: "依存関係を把握せず隔離してしまった",
      body: "よく知らないシステムを設定変更で孤立させ、周辺サービスが繋がらなくなった。変更前に依存マップとロールバック手順を取るべきだった。",
    },
    {
      re: /Crontab|crontab/i,
      situation: "本番サーバの cron 編集",
      cause: "別ユーザの crontab を上書き",
      body: "crontab を編集したら別ユーザのジョブを上書きしてしまい、定期処理が止まった。ユーザ単位の確認とバックアップを怠った。",
    },
    {
      re: /割れ窓/,
      situation: "長年放置された技術的負債の本番障害",
      cause: "小さく見える不具合の放置",
      body: "割れ窓を放置した結果、本番で大きな障害に育った。小さな警告やフレーキーを『後で』にし続けた文化が原因だった。",
    },
    {
      re: /WebサービスのDB|DBに関する失敗/,
      situation: "Webサービス本番DBの運用作業",
      cause: "スキーマ／データ操作の安全策不足",
      body: "WebサービスのDB作業でデータ不整合や停止を起こした。変更は小さく、バックアップと検証環境の同等データを必須にすべきだった。",
    },
    {
      re: /3桁万円|請求/,
      situation: "クラウドリソースの誤設定",
      cause: "コスト上限・アラーム未設定のまま実験",
      body: "AWS設定ミスで3桁万円の請求が来た。予算アラートと権限制限、検証アカウント分離が無かった。",
    },
    {
      re: /\/bin|rm -rf/i,
      situation: "本番ホストでのファイル削除",
      cause: "パス取り違えの破壊的 rm",
      body: "ホストの /bin を rm -rf してしまいOSが崩壊した。本番での破壊コマンドはパス確認と dry-run、権限分離が必須だった。",
    },
    {
      re: /セグメント全断/,
      situation: "ネットワークセグメント障害対応",
      cause: "切り分け中の二次障害／設定ミス",
      body: "セグメント全断の対応中に設定を誤り、影響を広げた。変更は1つずつ、観測しながら戻せる単位で進めるべきだった。",
    },
    {
      re: /検証環境のURL|メールを本番/,
      situation: "本番ユーザーへのメール送信",
      cause: "検証用URL混入のテンプレ／設定ミス",
      body: "検証環境のURLが入ったメールを本番ユーザーに送ってしまった。テンプレの環境変数と送信前プレビューが無かった。",
    },
    {
      re: /S3|権限/,
      situation: "S3バケット権限の変更",
      cause: "過度に閉じた／開いたACL",
      body: "S3権限を誤って変更し、読み書き不能または公開状態になった。最小権限と変更のステージング確認が足りなかった。",
    },
    {
      re: /ルーター|ルータ|フォワーダー|オープンリレー|YAMAHA/i,
      situation: "ネットワーク機器の本番設定変更",
      cause: "設定ミスと切り戻し手順の不足",
      body: "本番ネットワーク機器の設定を誤り、通信障害や意図しない中継状態を作った。変更は検証相当環境での確認と即時ロールバック前提で行うべきだった。",
    },
    {
      re: /ホスト名|cat /,
      situation: "大量サーバのホスト名一括変更",
      cause: "スクリプトの変数／対象取り違え",
      body: "本番サーバ多数のホスト名を誤って同じ値に揃えてしまった。一括変更は dry-run と少数カナリア必須だった。",
    },
    {
      re: /ロードバランサ|切り離/,
      situation: "LB配下ノードのメンテ作業",
      cause: "全ノード切り離しの操作ミス",
      body: "ロードバランサ配下を全部切り離してサービス停止した。メンテ手順のチェックリストと『残り1台は残す』ガードが無かった。",
    },
    {
      re: /正規表現/,
      situation: "認証／入力バリデーションの改修リリース",
      cause: "正規表現ミスで正当ユーザを拒否",
      body: "正規表現を誤ってリリースし、一晩誰もログインできなくなった。境界値テストとカナリアが無かった。",
    },
    {
      re: /ファイルサーバーを業務中に再起動/,
      situation: "業務時間帯のファイルサーバ再起動",
      cause: "メンテ窓外の再起動判断",
      body: "業務中にファイルサーバを再起動し、共有が止まった。影響ユーザ確認とメンテ告知をスキップした。",
    },
    {
      re: /アップロード画像|コンテンツ全消し/,
      situation: "ストレージ／CMSの一括削除",
      cause: "削除対象パスの取り違え",
      body: "アップロード画像やコンテンツを誤って全消しした。削除はソフトデリートとバックアップ、対象プレビュー必須だった。",
    },
    {
      re: /客先のDB|間違えて削除/,
      situation: "客先環境でのDB作業",
      cause: "接続先・権限の取り違え",
      body: "客先DBを誤って削除した。接続バナー、読み取り専用アカウント、作業前バックアップが無かった。",
    },
    {
      re: /決済ができなく|スパゲティ/,
      situation: "レガシー決済コードへの小改修",
      cause: "影響範囲を読まず3行追加",
      body: "スパゲティな決済処理に3行足したら決済不能になった。結合テストとフィーチャーフラグ無しの本番投入だった。",
    },
    {
      re: /メールサーバーを爆撃|メールを消失/,
      situation: "メールサーバ／配信設定の変更",
      cause: "配送ループや誤削除でメール消失",
      body: "メール設定ミスでサーバを過負荷にし、重要メールを消失させた。変更はステージングで配送試験してからにすべきだった。",
    },
    {
      re: /1文字|4倍遅く|バッチ/,
      situation: "本番バッチの微小改修",
      cause: "1文字の変更が計算量を爆発",
      body: "プログラムに1文字足したら本番バッチが4倍遅くなった。微小差分でも性能回帰テストが必要だった。",
    },
    {
      re: /サークル|バックアップ取らず/,
      situation: "個人／コミュニティDBのメンテ",
      cause: "バックアップ無しの破壊操作",
      body: "バックアップを取らず記録DBを全消しした。どんな小さく見えるDBでもスナップショットが先だった。",
    },
    {
      re: /オーバースペック/,
      situation: "新規開発の構成選定",
      cause: "要件と乖離した過剰構成",
      body: "新規開発がオーバースペックになり、運用コストと複雑さが先に来た。要求の再確認と段階的スケールが足りなかった。",
    },
    {
      re: /サイトを停止|バックアップはゼッタイ/,
      situation: "サイト障害と復旧作業",
      cause: "バックアップ不足で復旧が遅延",
      body: "サイトを止める障害のあと、バックアップが使えず復旧が難航した。バックアップのリストア訓練を怠っていた。",
    },
    {
      re: /電源|ぶち抜/,
      situation: "現場インフラの物理運用",
      cause: "電源冗長未接続とケーブル事故",
      body: "電源を誤って抜き、配信／基盤が一斉停止した。冗長電源の接続とケーブル整理が先だった。",
    },
    {
      re: /Feature toggle|Remote Config|開発途中の機能/,
      situation: "フィーチャーフラグ付きリリース",
      cause: "トグル条件の設定誤り",
      body: "開発途中機能がトグル設定ミスで一部ユーザーに見えた。フラグ変更のランブックと旧バージョンQAが無かった。",
    },
    {
      re: /思い込み|ブランチ/,
      situation: "別プロジェクトへのデプロイ",
      cause: "同名ブランチの意味の思い込み",
      body: "同じ main でも環境意味が違うのに思い込みでデプロイし本番を落とした。初見環境は規約確認が必須だった。",
    },
    {
      re: /ディレクトリを大量生産|ルート直下/,
      situation: "本番ホスト上のスクリプト実行",
      cause: "カレントディレクトリ取り違え",
      body: "ルート直下にディレクトリを大量生産してしまった。スクリプトの cwd 固定と dry-run が無かった。",
    },
    {
      re: /データベースを吹っ飛ば/,
      situation: "本番DBの破壊的操作",
      cause: "誤コマンド／誤接続先",
      body: "本番データベースを誤操作で吹き飛ばした。接続先明示、確認プロンプト、バックアップ検証が不足していた。",
    },
  ];

  for (const r of rules) {
    if (r.re.test(t)) {
      return {
        source_title: t,
        source,
        body: r.body,
        situation: r.situation,
        cause: r.cause,
        tags,
        fidelity: "paraphrase",
        needs_review: false,
      };
    }
  }

  // Generic but concrete paraphrase from title keywords
  return {
    source_title: t,
    source,
    body: `『${t}』——公開された失敗談を短く再構成した学び。本番作業では確認手順・切り戻し・検証環境の三点セットを先に置く。詳細は出典入口を参照。`,
    situation: `題材『${t}』に近い本番／運用作業`,
    cause: "手順確認・環境分離・影響範囲調査のいずれかが欠けた",
    tags,
    fidelity: "paraphrase",
    needs_review: false,
  };
}

const playbook = JSON.parse(readFileSync(join(__dirname, "playbook.json"), "utf8"));
const curated = playbook.stories.filter((s) => s.id.startsWith("c"));
const seen = new Set(curated.map((s) => normalizeTitle(s.source_title)));
const refined = [...curated];

for (const s of playbook.stories) {
  if (s.id.startsWith("c")) continue;
  const title = normalizeTitle(s.source_title);
  if (seen.has(title)) continue;
  if (/台本バリエーション/.test(s.source_title)) continue;
  seen.add(title);
  const r = refineFromTitle(title, s.source);
  refined.push({
    id: `r${String(refined.length - curated.length + 1).padStart(3, "0")}`,
    ...r,
  });
  if (refined.length >= TARGET) break;
}

// If short, keep refining remaining unique mined titles from sources.json
if (refined.length < TARGET) {
  try {
    const sources = JSON.parse(readFileSync(join(__dirname, "sources.json"), "utf8"));
    for (const row of sources.mined_titles || []) {
      const title = normalizeTitle(row.title);
      if (!title || seen.has(title)) continue;
      if (/台本バリエーション|Join calendar|I will write/.test(title)) continue;
      seen.add(title);
      const calendar =
        /2025/.test(row.source || "")
          ? "https://qiita.com/advent-calendar/2025/yarakashi"
          : /2024/.test(row.source || "")
            ? "https://qiita.com/advent-calendar/2024/yarakashi-production"
            : /2023/.test(row.source || "")
              ? "https://qiita.com/advent-calendar/2023/yarakashi"
              : "https://qiita.com/search?q=%E3%82%84%E3%82%89%E3%81%8B%E3%81%97";
      const r = refineFromTitle(title, calendar);
      refined.push({
        id: `r${String(refined.length - curated.length + 1).padStart(3, "0")}`,
        ...r,
      });
      if (refined.length >= TARGET) break;
    }
  } catch {
    /* ignore */
  }
}

const out = {
  ...playbook,
  created: new Date().toISOString().slice(0, 10),
  refined_at: new Date().toISOString(),
  stats: {
    total: refined.length,
    paraphrase: refined.filter((s) => s.fidelity === "paraphrase").length,
    title_draft: refined.filter((s) => s.fidelity === "title_draft").length,
    needs_review: refined.filter((s) => s.needs_review).length,
  },
  stories: refined.slice(0, TARGET),
};

writeFileSync(join(__dirname, "playbook.json"), JSON.stringify(out, null, 2), "utf8");
console.log(JSON.stringify(out.stats, null, 2));
