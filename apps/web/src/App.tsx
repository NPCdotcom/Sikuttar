import { useCallback, useEffect, useState, type FormEvent } from "react";

type PublicCounts = {
  wakaru: number;
  reference: number;
};

type PublicStory = {
  id: string;
  body: string;
  situation: string | null;
  cause: string | null;
  createdAt: string;
  counts: PublicCounts;
};

export function App() {
  const [body, setBody] = useState("");
  const [situation, setSituation] = useState("");
  const [cause, setCause] = useState("");
  const [items, setItems] = useState<PublicStory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reactingId, setReactingId] = useState<string | null>(null);
  const [relatedById, setRelatedById] = useState<Record<string, PublicStory[]>>({});
  const [relatedLoading, setRelatedLoading] = useState<string | null>(null);

  const renderFeed = useCallback(async () => {
    const res = await fetch("/stories", { credentials: "include" });
    if (!res.ok) {
      throw new Error(`一覧の取得に失敗しました (${res.status})`);
    }
    const data = (await res.json()) as { items: PublicStory[] };
    setItems(
      data.items.map((item) => ({
        ...item,
        counts: item.counts ?? { wakaru: 0, reference: 0 },
      })),
    );
  }, []);

  useEffect(() => {
    void renderFeed().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "一覧の取得に失敗しました");
    });
  }, [renderFeed]);

  async function composeAndSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/stories", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body,
          situation: situation || undefined,
          cause: cause || undefined,
        }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? `投稿に失敗しました (${res.status})`);
      }
      setBody("");
      setSituation("");
      setCause("");
      await renderFeed();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "投稿に失敗しました");
    } finally {
      setBusy(false);
    }
  }

  async function addReaction(storyId: string, kind: "wakaru" | "reference") {
    setError(null);
    setReactingId(`${storyId}:${kind}`);
    try {
      const res = await fetch(`/stories/${storyId}/reactions`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      if (!res.ok && res.status !== 409) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? `リアクションに失敗しました (${res.status})`);
      }
      await renderFeed();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "リアクションに失敗しました");
    } finally {
      setReactingId(null);
    }
  }

  async function loadRelated(storyId: string) {
    setError(null);
    if (relatedById[storyId]) {
      setRelatedById((prev) => {
        const next = { ...prev };
        delete next[storyId];
        return next;
      });
      return;
    }
    setRelatedLoading(storyId);
    try {
      const res = await fetch(`/stories/${storyId}/related`, { credentials: "include" });
      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? `関連の取得に失敗しました (${res.status})`);
      }
      const data = (await res.json()) as { items: PublicStory[] };
      setRelatedById((prev) => ({
        ...prev,
        [storyId]: data.items.map((item) => ({
          ...item,
          counts: item.counts ?? { wakaru: 0, reference: 0 },
        })),
      }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "関連の取得に失敗しました");
    } finally {
      setRelatedLoading(null);
    }
  }

  return (
    <main className="shell">
      <h1>シクッター</h1>
      <p className="tagline">しくじったら、シクッター。</p>

      <form className="compose" onSubmit={composeAndSubmit}>
        <label>
          失敗談（必須）
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            required
            placeholder="何が起きたか、ぐちっと書いてください"
          />
        </label>
        <label>
          状況（任意）
          <input value={situation} onChange={(e) => setSituation(e.target.value)} />
        </label>
        <label>
          原因（任意）
          <input value={cause} onChange={(e) => setCause(e.target.value)} />
        </label>
        <button type="submit" disabled={busy || !body.trim()}>
          {busy ? "投稿中…" : "投稿する"}
        </button>
      </form>

      {error ? <p className="error" role="alert">{error}</p> : null}

      <section className="feed" aria-label="失敗談フィード">
        <h2>フィード</h2>
        {items.length === 0 ? (
          <p className="empty">まだ投稿がありません。</p>
        ) : (
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <p className="story-body">{item.body}</p>
                {item.situation ? <p className="meta">状況: {item.situation}</p> : null}
                {item.cause ? <p className="meta">原因: {item.cause}</p> : null}
                <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString("ja-JP")}</time>
                <div className="reactions" aria-label="限定リアクション">
                  <button
                    type="button"
                    disabled={reactingId !== null}
                    onClick={() => void addReaction(item.id, "wakaru")}
                  >
                    わかる · {item.counts.wakaru}
                  </button>
                  <button
                    type="button"
                    disabled={reactingId !== null}
                    onClick={() => void addReaction(item.id, "reference")}
                  >
                    参考になる · {item.counts.reference}
                  </button>
                  <button
                    type="button"
                    className="related-toggle"
                    disabled={relatedLoading === item.id}
                    onClick={() => void loadRelated(item.id)}
                  >
                    {relatedLoading === item.id
                      ? "関連を取得中…"
                      : relatedById[item.id]
                        ? "関連を閉じる"
                        : "関連する失敗談"}
                  </button>
                </div>
                {relatedById[item.id] ? (
                  <div className="related" aria-label="関連する失敗談">
                    {relatedById[item.id].length === 0 ? (
                      <p className="empty">関連する投稿は見つかりませんでした。</p>
                    ) : (
                      <ul>
                        {relatedById[item.id].map((rel) => (
                          <li key={rel.id}>
                            <p className="story-body">{rel.body}</p>
                            {rel.situation ? <p className="meta">状況: {rel.situation}</p> : null}
                            {rel.cause ? <p className="meta">原因: {rel.cause}</p> : null}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
