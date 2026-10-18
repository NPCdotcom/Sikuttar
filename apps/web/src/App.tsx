import { useCallback, useEffect, useState } from "react";
import {
  addBookmark,
  askSecretary,
  deleteStory,
  fetchBookmarks,
  fetchDashboard,
  fetchMyStories,
  fetchUsedTags,
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
import type {
  AppView,
  DashboardPayload,
  PublicStory,
  ReactionKind,
} from "./types";
import { AssistantView } from "./views/AssistantView";
import { ComposeView } from "./views/ComposeView";
import { DashboardView } from "./views/DashboardView";
import { DetailView } from "./views/DetailView";
import { FeedView } from "./views/FeedView";
import { ProfileView } from "./views/ProfileView";
import { SearchView } from "./views/SearchView";
import { bareTagName } from "./formatTag";

export function App() {
  const [view, setView] = useState<AppView>("dashboard");
  const [items, setItems] = useState<PublicStory[]>([]);
  const [usedTags, setUsedTags] = useState<string[]>([]);
  const [searchInitialQuery, setSearchInitialQuery] = useState("");
  const [searchHashtagMode, setSearchHashtagMode] = useState(false);
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
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

  const refreshFeed = useCallback(async () => {
    const next = await fetchStories();
    setItems(next);
    return next;
  }, []);

  const refreshUsedTags = useCallback(async () => {
    setUsedTags(await fetchUsedTags());
  }, []);

  const refreshDashboard = useCallback(async () => {
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      setDashboard(await fetchDashboard());
    } catch (err: unknown) {
      setDashboardError(
        err instanceof Error
          ? err.message
          : "ダッシュボードの取得に失敗しました",
      );
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUsedTags().catch(() => undefined);
  }, [refreshUsedTags]);

  useEffect(() => {
    void refreshFeed().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "一覧の取得に失敗しました");
    });
  }, [refreshFeed]);

  useEffect(() => {
    if (view === "dashboard") {
      void refreshDashboard();
    }
  }, [view, refreshDashboard]);

  const detailStory =
    detailId === null
      ? null
      : (items.find((item) => item.id === detailId) ??
        bookmarkItems.find((item) => item.id === detailId) ??
        myStories.find((item) => item.id === detailId) ??
        searchResults.find((item) => item.id === detailId) ??
        dashboard?.recent.find((item) => item.id === detailId) ??
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
    if (next !== "search") {
      setSearchHashtagMode(false);
      setSearchInitialQuery("");
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

  /** Twitter-like hashtag: open search with posts tagged (not feed chips). */
  async function openHashtag(tag: string) {
    const name = bareTagName(tag);
    if (!name) return;
    setError(null);
    setDetailId(null);
    setRelated(null);
    setSearchHashtagMode(true);
    setSearchInitialQuery(name);
    setHasSearched(true);
    setSearchLoading(true);
    setSearchError(null);
    setView("search");
    try {
      setSearchResults(await fetchStories(name));
    } catch (err: unknown) {
      setSearchResults([]);
      setSearchError(
        err instanceof Error ? err.message : "タグ検索に失敗しました",
      );
    } finally {
      setSearchLoading(false);
    }
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

  async function handleDeleteStory(storyId: string) {
    if (!window.confirm("この投稿を削除しますか？")) {
      return;
    }
    setError(null);
    setDeletingId(storyId);
    try {
      await deleteStory(storyId);
      setMyStories((prev) => prev.filter((s) => s.id !== storyId));
      setItems((prev) => prev.filter((s) => s.id !== storyId));
      setBookmarkItems((prev) => prev.filter((s) => s.id !== storyId));
      setSearchResults((prev) => prev.filter((s) => s.id !== storyId));
      if (detailId === storyId) {
        setDetailId(null);
        setRelated(null);
        setView("profile");
      }
      await refreshUsedTags().catch(() => undefined);
      await refreshDashboard().catch(() => undefined);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "投稿の削除に失敗しました");
    } finally {
      setDeletingId(null);
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
    setSearchHashtagMode(false);
    setSearchInitialQuery(q);
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
      await refreshFeed();
      await refreshUsedTags().catch(() => undefined);
      await refreshDashboard().catch(() => undefined);
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
      await refreshFeed();
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

      {view === "dashboard" ? (
        <DashboardView
          data={dashboard}
          loading={dashboardLoading}
          error={dashboardError}
          onCompose={() => navigate("compose")}
          onFeed={() => navigate("feed")}
          onOpenDetail={openDetail}
          onHashtag={(tag) => void openHashtag(tag)}
        />
      ) : null}

      {view === "feed" ? (
        <FeedView
          items={items}
          reactingId={reactingId}
          onReact={(storyId, kind) => void handleReact(storyId, kind)}
          onOpenDetail={openDetail}
          onHashtag={(tag) => void openHashtag(tag)}
          bookmarkedIds={bookmarkedIds}
          onBookmark={(storyId) => void handleBookmark(storyId)}
        />
      ) : null}

      {view === "compose" ? (
        <ComposeView
          busy={busy}
          suggestedTags={usedTags}
          onSubmit={handleCompose}
        />
      ) : null}

      {view === "search" ? (
        <SearchView
          results={searchResults}
          loading={searchLoading}
          error={searchError}
          hasSearched={hasSearched}
          initialQuery={searchInitialQuery}
          hashtagMode={searchHashtagMode}
          reactingId={reactingId}
          bookmarkedIds={bookmarkedIds}
          onSearch={(q) => void handleSearch(q)}
          onReact={(storyId, kind) => void handleReact(storyId, kind)}
          onOpenDetail={openDetail}
          onHashtag={(tag) => void openHashtag(tag)}
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
          onDeleteStory={(storyId) => void handleDeleteStory(storyId)}
          deletingId={deletingId}
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
          onHashtag={(tag) => void openHashtag(tag)}
          onDelete={
            myStories.some((s) => s.id === detailStory.id)
              ? () => void handleDeleteStory(detailStory.id)
              : undefined
          }
          deleting={deletingId === detailStory.id}
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
