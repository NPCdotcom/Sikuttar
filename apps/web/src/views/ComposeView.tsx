import { useState, type FormEvent } from "react";
import { bareTagName, formatHashtag } from "../formatTag";

type Props = {
  busy: boolean;
  suggestedTags: string[];
  onSubmit: (input: {
    body: string;
    situation: string;
    cause: string;
    tags: string[];
  }) => Promise<void>;
};

export function ComposeView({ busy, suggestedTags, onSubmit }: Props) {
  const [body, setBody] = useState("");
  const [situation, setSituation] = useState("");
  const [cause, setCause] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");

  function toggleTag(tag: string) {
    const name = bareTagName(tag);
    if (!name) return;
    setSelectedTags((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name],
    );
  }

  function addTagFromDraft() {
    const name = bareTagName(tagDraft);
    if (!name) return;
    setSelectedTags((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setTagDraft("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const pending = bareTagName(tagDraft);
    const tags = pending
      ? selectedTags.includes(pending)
        ? selectedTags
        : [...selectedTags, pending]
      : selectedTags;
    await onSubmit({ body, situation, cause, tags });
    setBody("");
    setSituation("");
    setCause("");
    setSelectedTags([]);
    setTagDraft("");
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
        <fieldset className="tag-fieldset">
          <legend>ハッシュタグ（任意）</legend>
          <p className="hint">自由に追加できます。例: #デプロイ</p>
          <div className="custom-tag">
            <input
              type="text"
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              placeholder="#学びの類型"
              maxLength={31}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  if (bareTagName(tagDraft)) {
                    e.preventDefault();
                    addTagFromDraft();
                  }
                }
              }}
            />
            <button type="button" onClick={addTagFromDraft}>
              追加
            </button>
          </div>
          {selectedTags.length > 0 ? (
            <div className="tag-options" role="group" aria-label="付与するタグ">
              {selectedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="tag selected"
                  onClick={() => toggleTag(tag)}
                  aria-pressed
                  title="クリックで外す"
                >
                  {formatHashtag(tag)}
                </button>
              ))}
            </div>
          ) : null}
          {suggestedTags.length > 0 ? (
            <>
              <p className="hint">よく使われているタグ（任意）</p>
              <div className="tag-options" role="group" aria-label="既存タグ">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={
                      selectedTags.includes(tag) ? "tag selected" : "tag"
                    }
                    onClick={() => toggleTag(tag)}
                    aria-pressed={selectedTags.includes(tag)}
                  >
                    {formatHashtag(tag)}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </fieldset>
        <button type="submit" disabled={busy || !body.trim()}>
          {busy ? "投稿中…" : "投稿する"}
        </button>
      </form>
    </section>
  );
}
