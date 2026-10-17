import { useState, type FormEvent } from "react";

type Props = {
  busy: boolean;
  recommendedTags: string[];
  onSubmit: (input: {
    body: string;
    situation: string;
    cause: string;
    tags: string[];
  }) => Promise<void>;
};

export function ComposeView({ busy, recommendedTags, onSubmit }: Props) {
  const [body, setBody] = useState("");
  const [situation, setSituation] = useState("");
  const [cause, setCause] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [customTags, setCustomTags] = useState<string[]>([]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function addCustomTag() {
    const tag = customTag.trim();
    if (!tag) return;

    setCustomTags((prev) =>
      recommendedTags.includes(tag) || prev.includes(tag) ? prev : [...prev, tag],
    );
    setSelectedTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
    setCustomTag("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await onSubmit({ body, situation, cause, tags: selectedTags });
    setBody("");
    setSituation("");
    setCause("");
    setSelectedTags([]);
    setCustomTags([]);
    setCustomTag("");
  }

  const chipTags = [...recommendedTags, ...customTags];

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
        <fieldset className="tag-fieldset">
          <legend>分類タグ（任意）</legend>
          <div className="tag-options" role="group" aria-label="タグ候補">
            {chipTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={selectedTags.includes(tag) ? "tag selected" : "tag"}
                onClick={() => toggleTag(tag)}
                aria-pressed={selectedTags.includes(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="custom-tag">
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              placeholder="好きなタグを入力"
              maxLength={30}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomTag();
                }
              }}
            />
            <button type="button" onClick={addCustomTag}>
              追加
            </button>
          </div>
        </fieldset>
        <button type="submit" disabled={busy || !body.trim()}>
          {busy ? "投稿中…" : "投稿する"}
        </button>
      </form>
    </section>
  );
}
