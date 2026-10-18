import { useCallback, useEffect, useState } from "react";
import {
  addBookmark,
  askSecretary,
  fetchBookmarks,
  fetchMyStories,
  fetchRecommendedTags,
  fetchRelated,
  fetchSearch,
  fetchSession,
  fetchStories,
  logoutSession,
  postReaction,
  postStory,
  removeBookmark,
} from "./api";
import { AppLayout } from "./components/AppLayout";
import type { AppView, PublicStory, ReactionKind } from "./types";
import { AssistantView } from "./views/AssistantView";
import { ComposeView } from "./views/ComposeView";
import { DetailView } from "./views/DetailView";
import { FeedView } from "./views/FeedView";
import { ProfileView } from "./views/ProfileView";
import { SearchView } from "./views/SearchView";

export function App() {
  const [view, setView] = useState<AppView>("feed");
  const [items, setItems] = useState<PublicStory[]>([]);
  const [recommendedTags, setRecommendedTags] = useState<string[]>([]);
  const [feedTag, setFeedTag] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [related, setRelated] = useState<PublicStory[] | null>(null);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reactingId, setReactingId] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [sessionError, setSessionError] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [bookmarkItems, setBookmarkItems] = useState<PublicStory[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);
  const [bookmarksError, setBookmarksError] = useState<string | null>(null);
  const [myStories, setMyStories] = useState<PublicStory[]>([]);
  const [myStoriesLoading, setMyStoriesLoading] = useState(false);
  const [myStoriesError, setMyStoriesError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<PublicStory[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [assistantQuestion, setAssistantQuestion] = useState("");
  const [assistantSeedId, setAssistantSeedId] = useState<string | null>(null);
  const [assistantEvidenceStories, setAssistantEvidenceStories] = useState<
    PublicStory[]
  >([]);

  const refreshSession = useCallback(async () => {
    setSessionError(false);
    try {
      setLoggedIn(await fetchSession());
    } catch {
      setLoggedIn(null);
      setSessionError(true);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const loadBookmarks = useCallback(async () => {
    setBookmarksLoading(true);
    setBookmarksError(null);
    try {
      const stories = await fetchBookmarks();
      setBookmarkItems(stories);
      setBookmarkedIds(new Set(stories.map((story) => story.id)));
    } catch (err: unknown) {
      setBookmarkItems([]);
      setBookmarkedIds(new Set());
      setBookmarksError(
        err instanceof Error
          ? err.message
          : "ブックマーク一覧の取得に失敗しました",
      );
    } finally {
      setBookmarksLoading(false);
    }
  }, []);

  const loadMyStories = useCallback(async () => {
    setMyStoriesLoading(true);
    setMyStoriesError(null);
    try {
      setMyStories(await fetchMyStories());
    } catch (err: unknown) {
      setMyStories([]);
      setMyStoriesError(
        err instanceof Error
          ? err.message
          : "自分の投稿一覧の取得に失敗しました",
      );
    } finally {
      setMyStoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loggedIn !== true) {
      setBookmarkItems([]);
      setBookmarkedIds(new Set());
      setBookmarksError(null);
      setMyStories([]);
      setMyStoriesError(null);
      return;
    }
    void loadBookmarks();
    void loadMyStories();
  }, [loggedIn, loadBookmarks, loadMyStories]);

  const refreshFeed = useCallback(async (tag: string | null) => {
    const next = await fetchStories(tag);
    setItems(next);
    return next;
  }, []);

  useEffect(() => {
    void fetchRecommendedTags()
      .then(setRecommendedTags)
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "タグ候補の取得に失敗しました",
        );
      });
  }, []);

  useEffect(() => {
    void refreshFeed(feedTag).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "一覧の取得に失敗しました");
    });
  }, [feedTag, refreshFeed]);

  const detailStory =
    detailId === null
      ? null
      : (items.find((item) => item.id === detailId) ??
        bookmarkItems.find((item) => item.id === detailId) ??
        myStories.find((item) => item.id === detailId) ??
        searchResults.find((item) => item.id === detailId) ??
        assistantEvidenceStories.find((item) => item.id === detailId) ??
        null);

  useEffect(() => {
    if (view !== "detail" || !detailId) {
      setRelated(null);
      return;
    }
    let cancelled = false;
    setRelatedLoading(true);
    void fetchRelated(detailId)
      .then((itemsRelated) => {
        if (!cancelled) {
          setRelated(itemsRelated);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "関連の取得に失敗しました");
          setRelated([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setRelatedLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [view, detailId]);

  function navigate(next: AppView) {
    setError(null);
    if (next !== "detail") {
      setDetailId(null);
      setRelated(null);
    }
    if (next !== "assistant") {
      setAssistantSeedId(null);
      setAssistantQuestion("");
    }
    // Bookmarks live inside profile (X-like); keep legacy view id mapped.
    setView(next === "bookmarks" ? "profile" : next);
  }

  function openAssistantFromStory(story: PublicStory) {
    setError(null);
    setAssistantSeedId(story.id);
    setAssistantQuestion(story.body);
    setDetailId(null);
    setRelated(null);
    setView("assistant");
  }

  function openDetail(storyId: string) {
    setError(null);
    setDetailId(storyId);
    setView("detail");
  }

  function handleFilterTag(tag: string | null) {
    setError(null);
    setFeedTag(tag);
  }

  async function handleLogout() {
    setError(null);
    try {
      await logoutSession();
      setLoggedIn(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "ログアウトに失敗しました");
    }
  }

  async function handleBookmark(storyId: string) {
    setError(null);
    const isBookmarked = bookmarkedIds.has(storyId);
    try {
      if (isBookmarked) {
        await removeBookmark(storyId);
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.delete(storyId);
          return next;
        });
        setBookmarkItems((prev) => prev.filter((item) => item.id !== storyId));
      } else {
        await addBookmark(storyId);
        setBookmarkedIds((prev) => new Set(prev).add(storyId));
        if (view === "bookmarks") {
          await loadBookmarks();
        }
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "ブックマークの操作に失敗しました",
      );
    }
  }

  async function handleSearch(q: string) {
    setSearchError(null);
    setHasSearched(true);
    setSearchLoading(true);
    try {
      setSearchResults(await fetchSearch(q));
    } catch (err: unknown) {
      setSearchResults([]);
      setSearchError(err instanceof Error ? err.message : "検索に失敗しました");
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleCompose(input: {
    body: string;
    situation: string;
    cause: string;
    tags: string[];
  }) {
    setError(null);
    setBusy(true);
    try {
      await postStory(input);
      setFeedTag(null);
      await refreshFeed(null);
      navigate("feed");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "投稿に失敗しました");
    } finally {
      setBusy(false);
    }
  }

  async function handleReact(storyId: string, kind: ReactionKind) {
    setError(null);
    setReactingId(`${storyId}:${kind}`);
    try {
      await postReaction(storyId, kind);
      await refreshFeed(feedTag);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "リアクションに失敗しました");
    } finally {
      setReactingId(null);
    }
  }

  return (
    <AppLayout
      view={view}
      onNavigate={navigate}
      loggedIn={loggedIn}
      sessionError={sessionError}
      onLogout={() => void handleLogout()}
    >
      {error ? <p className="error" role="alert">{error}</p> : null}

      {view === "feed" ? (
        <FeedView
          items={items}
          recommendedTags={recommendedTags}
          selectedTag={feedTag}
          reactingId={reactingId}
          onFilterTag={handleFilterTag}
          onReact={(storyId, kind) => void handleReact(storyId, kind)}
          onOpenDetail={openDetail}
          bookmarkedIds={bookmarkedIds}
          onBookmark={(storyId) => void handleBookmark(storyId)}
        />
      ) : null}

      {view === "compose" ? (
        <ComposeView
          busy={busy}
          recommendedTags={recommendedTags}
          onSubmit={handleCompose}
        />
      ) : null}

      {view === "search" ? (
        <SearchView
          results={searchResults}
          loading={searchLoading}
          error={searchError}
          hasSearched={hasSearched}
          reactingId={reactingId}
          bookmarkedIds={bookmarkedIds}
          onSearch={(q) => void handleSearch(q)}
          onReact={(storyId, kind) => void handleReact(storyId, kind)}
          onOpenDetail={openDetail}
          onBookmark={(storyId) => void handleBookmark(storyId)}
        />
      ) : null}

      {view === "assistant" ? (
        <AssistantView
          initialQuestion={assistantQuestion}
          seedStoryId={assistantSeedId}
          onAsk={async (input) => {
            const result = await askSecretary(input);
            setAssistantEvidenceStories(
              result.evidence.map((e) => ({
                id: e.id,
                body: e.body,
                situation: null,
                cause: null,
                createdAt: "",
                counts: { wakaru: 0, reference: 0 },
                tags: e.tags,
              })),
            );
            return result;
          }}
          onOpenEvidence={openDetail}
        />
      ) : null}

      {view === "profile" ? (
        <ProfileView
          loggedIn={loggedIn}
          myStories={myStories}
          myStoriesLoading={myStoriesLoading}
          myStoriesError={myStoriesError}
          bookmarkItems={bookmarkItems}
          bookmarksLoading={bookmarksLoading}
          bookmarksError={bookmarksError}
          bookmarkedIds={bookmarkedIds}
          onOpenDetail={openDetail}
          onBookmark={(storyId) => void handleBookmark(storyId)}
        />
      ) : null}

      {view === "detail" && detailStory ? (
        <DetailView
          story={detailStory}
          related={related}
          relatedLoading={relatedLoading}
          reacting={reactingId !== null}
          bookmarked={bookmarkedIds.has(detailStory.id)}
          onBack={() => navigate("feed")}
          onReact={(kind) => void handleReact(detailStory.id, kind)}
          onBookmark={() => void handleBookmark(detailStory.id)}
          onOpenRelated={openDetail}
          onAskSecretary={() => openAssistantFromStory(detailStory)}
        />
      ) : null}

      {view === "detail" && !detailStory ? (
        <section className="view">
          <p className="empty">投稿が見つかりませんでした。</p>
          <button type="button" className="back-link" onClick={() => navigate("feed")}>
            ← フィードに戻る
          </button>
        </section>
      ) : null}
    </AppLayout>
  );
}
