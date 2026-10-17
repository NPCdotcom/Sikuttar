import { StoryCard } from "../components/StoryCard";
import type { PublicStory } from "../types";

type Props = {
  items: PublicStory[];
  loading: boolean;
  error: string | null;
  loggedIn: boolean | null;
  bookmarkedIds: ReadonlySet<string>;
  onOpenDetail: (storyId: string) => void;
  onBookmark: (storyId: string) => void;
};

export function BookmarksView({
  items,
  loading,
  error,
  loggedIn,
  bookmarkedIds,
  onOpenDetail,
  onBookmark,
}: Props) {
  if (loggedIn === false) {
    return (
      <section className="view">
        <h2>保存した投稿</h2>
        <p className="empty">ブックマークはログイン後にだけ使えます。</p>
        <button
          type="button"
          className="back-link"
          onClick={() => window.location.assign("/auth/github")}
        >
          GitHubでログイン
        </button>
      </section>
    );
  }

  return (
    <section className="view">
      <h2>保存した投稿</h2>

      {loading ? (
        <p className="empty">読み込み中…</p>
      ) : error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : items.length === 0 ? (
        <p className="empty">保存した投稿はまだありません。</p>
      ) : (
        <ul className="card-list">
          {items.map((item) => (
            <li key={item.id}>
              <StoryCard
                story={item}
                clamp
                showDetailLink
                bookmarked={bookmarkedIds.has(item.id)}
                onBookmark={() => onBookmark(item.id)}
                onOpenDetail={() => onOpenDetail(item.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
