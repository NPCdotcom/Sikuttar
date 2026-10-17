import { useState, type FormEvent } from "react";
import { StoryCard } from "../components/StoryCard";
import type { PublicStory, ReactionKind } from "../types";

type Props = {
  results: PublicStory[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  reactingId: string | null;
  bookmarkedIds: ReadonlySet<string>;
  onSearch: (q: string) => void;
  onReact: (storyId: string, kind: ReactionKind) => void;
  onOpenDetail: (storyId: string) => void;
  onBookmark: (storyId: string) => void;
};

export function SearchView({
  results,
  loading,
  error,
  hasSearched,
  reactingId,
  bookmarkedIds,
  onSearch,
  onReact,
  onOpenDetail,
  onBookmark,
}: Props) {
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q) {
      return;
    }
    onSearch(q);
  }

  return (
    <section className="view" aria-label="意味検索">
      <h2>検索</h2>
      <p className="hint">近い失敗談を探します。結果に属性や身元は出ません。</p>

      <form className="compose" onSubmit={handleSubmit}>
        <label htmlFor="search-q">
          クエリ
          <input
            id="search-q"
            name="q"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例: デプロイに失敗した"
            disabled={loading}
            autoComplete="off"
          />
        </label>
        <button type="submit" disabled={loading || !query.trim()}>
          {loading ? "検索中…" : "検索する"}
        </button>
      </form>

      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}

      {!hasSearched && !loading ? (
        <p className="empty">キーワードを入れて検索してください。</p>
      ) : null}

      {hasSearched && !loading && !error && results.length === 0 ? (
        <p className="empty">近い投稿は見つかりませんでした。</p>
      ) : null}

      {results.length > 0 ? (
        <ul className="card-list">
          {results.map((item) => (
            <li key={item.id}>
              <StoryCard
                story={item}
                clamp
                reacting={reactingId !== null}
                showDetailLink
                onReact={(kind) => onReact(item.id, kind)}
                onOpenDetail={() => onOpenDetail(item.id)}
                bookmarked={bookmarkedIds.has(item.id)}
                onBookmark={() => onBookmark(item.id)}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
