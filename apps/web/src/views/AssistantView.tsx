import { useEffect, useState, type FormEvent } from "react";
import type { SecretaryAskResult } from "../types";

type Props = {
  initialQuestion?: string;
  seedStoryId?: string | null;
  onAsk: (input: {
    question: string;
    seedStoryId?: string;
  }) => Promise<SecretaryAskResult>;
  onOpenEvidence: (storyId: string) => void;
};

export function AssistantView({
  initialQuestion = "",
  seedStoryId = null,
  onAsk,
  onOpenEvidence,
}: Props) {
  const [question, setQuestion] = useState(initialQuestion);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SecretaryAskResult | null>(null);

  useEffect(() => {
    setQuestion(initialQuestion);
  }, [initialQuestion]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const q = question.trim();
    if (!q) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const next = await onAsk({
        question: q,
        seedStoryId: seedStoryId ?? undefined,
      });
      setResult(next);
    } catch (err: unknown) {
      setResult(null);
      setError(
        err instanceof Error ? err.message : "質問の送信に失敗しました",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="view" aria-label="質問">
      <h2>質問</h2>
      <p className="hint">
        蓄積された失敗談をもとに短い助言と根拠を返します（生成 AI
        は使いません）。話題の核になる語（例: デプロイ、OAuth、テスト）が入っていると見つかりやすいです。
      </p>

      <form className="compose" onSubmit={(e) => void handleSubmit(e)}>
        <label htmlFor="assistant-q">
          内容
          <textarea
            id="assistant-q"
            name="question"
            rows={4}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="例: デプロイ前の確認を飛ばしてしまったときの学びは？"
            disabled={busy}
          />
        </label>
        {seedStoryId ? (
          <p className="hint">投稿起点（参照 ID: {seedStoryId}）</p>
        ) : null}
        <button type="submit" disabled={busy || !question.trim()}>
          {busy ? "送信中…" : "質問する"}
        </button>
      </form>

      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="assistant-result">
          <h3>応答</h3>
          <p className="assistant-answer">{result.answer}</p>
          {result.attribute_hint ? (
            <p className="hint">属性ヒント（非公開集計）: 使用済み</p>
          ) : null}
          {result.evidence.length > 0 ? (
            <>
              <h3>根拠</h3>
              <ul className="card-list">
                {result.evidence.map((item) => (
                  <li key={item.id}>
                    <article className="story-card">
                      <p className="story-body clamp">{item.body}</p>
                      <p className="hint">
                        {item.role === "bookmark" ? "ブックマーク" : "コーパス"}
                        {item.tags.length > 0
                          ? ` · ${item.tags.join(", ")}`
                          : ""}
                      </p>
                      <button
                        type="button"
                        className="text-link"
                        onClick={() => onOpenEvidence(item.id)}
                      >
                        詳細を見る
                      </button>
                    </article>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="hint">
              根拠が見つからないときは、質問を短いキーワードに近づけるか、失敗談に出てくる語（デプロイ、OAuth、テストなど）を含めて再度試してください。文字数制限はありません。
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}
