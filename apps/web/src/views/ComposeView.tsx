import { useState, type FormEvent } from "react";

type Props = {
  busy: boolean;
  onSubmit: (input: {
    body: string;
    situation: string;
    cause: string;
  }) => Promise<void>;
};

export function ComposeView({ busy, onSubmit }: Props) {
  const [body, setBody] = useState("");
  const [situation, setSituation] = useState("");
  const [cause, setCause] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await onSubmit({ body, situation, cause });
    setBody("");
    setSituation("");
    setCause("");
  }

  return (
    <section className="view compose-view" aria-label="失敗談を投稿">
      <h2>投稿</h2>
      <form className="compose" onSubmit={(e) => void handleSubmit(e)}>
        <label>
          失敗談（必須）
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
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
    </section>
  );
}
