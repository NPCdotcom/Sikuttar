import { formatHashtag } from "../formatTag";
import { StoryCard } from "../components/StoryCard";
import type { DashboardPayload, PublicStory, TopicTag } from "../types";

type Props = {
  data: DashboardPayload | null;
  loading: boolean;
  error: string | null;
  onCompose: () => void;
  onFeed: () => void;
  onOpenDetail: (storyId: string) => void;
  onHashtag: (tag: string) => void;
};

function TopicBlock({
  title,
  items,
  emptyHint,
  onHashtag,
}: {
  title: string;
  items: TopicTag[];
  emptyHint: string;
  onHashtag: (tag: string) => void;
}) {
  return (
    <section className="dashboard-topic" aria-label={title}>
      <h3>{title}</h3>
      {items.length === 0 ? (
        <p className="empty">{emptyHint}</p>
      ) : (
        <ul className="topic-list">
          {items.map((item) => (
            <li key={item.name}>
              <button
                type="button"
                className="tag tag-chip"
                onClick={() => onHashtag(item.name)}
              >
                {formatHashtag(item.name)}
                <span className="topic-count">{item.count}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function DashboardView({
  data,
  loading,
  error,
  onCompose,
  onFeed,
  onOpenDetail,
  onHashtag,
}: Props) {
  if (loading && !data) {
    return (
      <section className="view dashboard" aria-label="ダッシュボード">
        <p className="empty">読み込み中…</p>
      </section>
    );
  }

  if (error && !data) {
    return (
      <section className="view dashboard" aria-label="ダッシュボード">
        <p className="error" role="alert">
          {error}
        </p>
      </section>
    );
  }

  const stats = data?.stats ?? {
    totalStories: 0,
    last24hStories: 0,
    totalWakaru: 0,
  };
  const recent: PublicStory[] = data?.recent ?? [];
  const topics = data?.topics ?? { day: [], week: [], month: [] };

  return (
    <section className="view dashboard" aria-label="ダッシュボード">
      <header className="dashboard-hero">
        <p className="dashboard-catch">しくじったら、シクッター。</p>
        <p className="hint">
          失敗談が集まると、同じ類型の学びが見えてきます。短く残して、次の誰かの手がかりに。
        </p>
        <button type="button" className="primary-btn" onClick={onCompose}>
          投稿する
        </button>
      </header>

      <div className="dashboard-stats" role="group" aria-label="概要数字">
        <button type="button" className="stat-tile" onClick={onFeed}>
          <span className="stat-value">{stats.totalStories}</span>
          <span className="stat-label">総投稿</span>
        </button>
        <div className="stat-tile">
          <span className="stat-value">{stats.last24hStories}</span>
          <span className="stat-label">直近24時間</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{stats.totalWakaru}</span>
          <span className="stat-label">「わかる」累計</span>
        </div>
      </div>

      <div className="dashboard-topics">
        <TopicBlock
          title="今日のしくじり類型"
          items={topics.day}
          emptyHint="まだ類型が集まり始めていません。最初の #デプロイ を残してみませんか？"
          onHashtag={onHashtag}
        />
        <TopicBlock
          title="今週よく出た学び"
          items={topics.week}
          emptyHint="今週のタグはまだありません。投稿にハッシュタグを付けてみましょう。"
          onHashtag={onHashtag}
        />
        <TopicBlock
          title="今月の失敗パターン"
          items={topics.month}
          emptyHint="今月のパターンはこれから。小さな失敗談から集まります。"
          onHashtag={onHashtag}
        />
      </div>

      <section className="dashboard-recent" aria-label="最近の失敗談">
        <h3>最近の失敗談</h3>
        {recent.length === 0 ? (
          <p className="empty">
            まだ投稿がありません。「投稿する」から最初のしくじりを残しましょう。
          </p>
        ) : (
          <ul className="card-list">
            {recent.map((item) => (
              <li key={item.id}>
                <StoryCard
                  story={item}
                  clamp
                  showDetailLink
                  onOpenDetail={() => onOpenDetail(item.id)}
                  onHashtag={onHashtag}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
