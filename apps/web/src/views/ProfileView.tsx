import { useState, type FormEvent } from "react";
import { patchAttributes } from "../api";
import { StoryCard } from "../components/StoryCard";
import type { PublicStory } from "../types";

const OCCUPATION_OPTIONS = ["学生", "エンジニア", "デザイナー", "その他"] as const;

type Props = {
  loggedIn: boolean | null;
  myStories: PublicStory[];
  myStoriesLoading: boolean;
  myStoriesError: string | null;
  bookmarkItems: PublicStory[];
  bookmarksLoading: boolean;
  bookmarksError: string | null;
  bookmarkedIds: ReadonlySet<string>;
  onOpenDetail: (storyId: string) => void;
  onBookmark: (storyId: string) => void;
};

export function ProfileView({
  loggedIn,
  myStories,
  myStoriesLoading,
  myStoriesError,
  bookmarkItems,
  bookmarksLoading,
  bookmarksError,
  bookmarkedIds,
  onOpenDetail,
  onBookmark,
}: Props) {
  const [occupation, setOccupation] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (loggedIn === false) {
    return (
      <section className="view" aria-label="プロフィール">
        <h2>プロフィール</h2>
        <p className="empty">
          プロフィールはログイン後にだけ見られます。公開身元は出しません。
        </p>
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

  if (loggedIn === null) {
    return (
      <section className="view" aria-label="プロフィール">
        <h2>プロフィール</h2>
        <p className="empty">ログイン状態を確認中…</p>
      </section>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      const value = occupation.trim();
      await patchAttributes({ occupation: value.length > 0 ? value : null });
      setMessage("保存しました（公開フィードには出ません）。");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "属性の保存に失敗しました");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="view profile" aria-label="プロフィール">
      <header className="profile-hero">
        <h2>プロフィール</h2>
        <p className="hint">
          本人専用です。表示名・フォローはなく、フィードにも身元は出ません。
        </p>
      </header>

      <section className="profile-section" aria-label="軽いプロフィール">
        <h3>内部属性</h3>
        <p className="hint">職業・立場などの内部属性。公開一覧には出ません。</p>
        <form className="compose" onSubmit={(e) => void handleSubmit(e)}>
          <label htmlFor="occupation">
            職業・立場
            <select
              id="occupation"
              name="occupation"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              disabled={busy}
            >
              <option value="">未設定</option>
              {OCCUPATION_OPTIONS.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          {error ? (
            <p className="error" role="alert">
              {error}
            </p>
          ) : null}
          {message ? <p className="hint">{message}</p> : null}
          <button type="submit" disabled={busy}>
            {busy ? "保存中…" : "保存する"}
          </button>
        </form>
      </section>

      <section className="profile-section" aria-label="自分の投稿">
        <h3>自分の投稿</h3>
        {myStoriesLoading ? (
          <p className="empty">読み込み中…</p>
        ) : myStoriesError ? (
          <p className="error" role="alert">
            {myStoriesError}
          </p>
        ) : myStories.length === 0 ? (
          <p className="empty">まだ自分の投稿はありません。</p>
        ) : (
          <ul className="card-list">
            {myStories.map((item) => (
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

      <section className="profile-section" aria-label="ブックマーク">
        <h3>ブックマーク</h3>
        {bookmarksLoading ? (
          <p className="empty">読み込み中…</p>
        ) : bookmarksError ? (
          <p className="error" role="alert">
            {bookmarksError}
          </p>
        ) : bookmarkItems.length === 0 ? (
          <p className="empty">保存した投稿はまだありません。</p>
        ) : (
          <ul className="card-list">
            {bookmarkItems.map((item) => (
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
    </section>
  );
}
