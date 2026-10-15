import { useCallback, useEffect, useState, type FormEvent } from "react";

type PublicStory = {
  id: string;
  body: string;
  situation: string | null;
  cause: string | null;
  createdAt: string;
};

export function App() {
  const [body, setBody] = useState("");
  const [situation, setSituation] = useState("");
  const [cause, setCause] = useState("");
  const [items, setItems] = useState<PublicStory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const renderFeed = useCallback(async () => {
    const res = await fetch("/stories", { credentials: "include" });
    if (!res.ok) {
      throw new Error(`一覧の取得に失敗しました (${res.status})`);
    }
    const data = (await res.json()) as { items: PublicStory[] };
    setItems(data.items);
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
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
