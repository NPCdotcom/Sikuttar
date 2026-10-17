import { useCallback, useEffect, useState } from "react";
import { ProfileView } from "./views/ProfileView";
import {
  fetchRecommendedTags,
  fetchRelated,
  fetchStories,
  postReaction,
  postStory,
} from "./api";
import { AppLayout } from "./components/AppLayout";
import type { AppView, PublicStory, ReactionKind } from "./types";
import { ComposeView } from "./views/ComposeView";
import { DetailView } from "./views/DetailView";
import { FeedView } from "./views/FeedView";

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
    detailId === null ? null : (items.find((item) => item.id === detailId) ?? null);

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
    setView(next);
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
    <AppLayout view={view} onNavigate={navigate}>
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
        />
      ) : null}

      {view === "compose" ? (
        <ComposeView
          busy={busy}
          recommendedTags={recommendedTags}
          onSubmit={handleCompose}
        />
      ) : null}

      {view === "profile" ? (
        <ProfileView />
      ) : null}

      {view === "detail" && detailStory ? (
        <DetailView
          story={detailStory}
          related={related}
          relatedLoading={relatedLoading}
          reacting={reactingId !== null}
          onBack={() => navigate("feed")}
          onReact={(kind) => void handleReact(detailStory.id, kind)}
          onOpenRelated={openDetail}
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
