import { useState, type FormEvent } from "react";
import { patchAttributes } from "../api";

const OCCUPATION_OPTIONS = ["学生", "エンジニア", "デザイナー", "その他"] as const;

type Props = {
  loggedIn: boolean | null;
};

export function ProfileView({ loggedIn }: Props) {
  const [occupation, setOccupation] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (loggedIn === false) {
    return (
      <section className="view">
        <h2>属性設定</h2>
        <p className="empty">
          属性はログイン後にだけ編集できます。フィードや詳細には表示されません。
        </p>
        <button
          type="button"
          className="back-link"
          onClick={() => window.location.assign("/auth/github")}
        >
          GitHubでログイン
        </button>
      </section>
    );
  }

  if (loggedIn === null) {
    return (
      <section className="view">
        <h2>属性設定</h2>
        <p className="empty">ログイン状態を確認中…</p>
      </section>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      const value = occupation.trim();
      await patchAttributes({ occupation: value.length > 0 ? value : null });
      setMessage("保存しました（公開フィードには出ません）。");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "属性の保存に失敗しました");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="view">
      <h2>属性設定</h2>
      <p className="hint">
        職業・立場などの内部属性です。フィード・詳細・検索結果には出ません。
      </p>

      <form className="compose" onSubmit={(e) => void handleSubmit(e)}>
        <label htmlFor="occupation">
          職業・立場
          <select
            id="occupation"
            name="occupation"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            disabled={busy}
          >
            <option value="">未設定</option>
            {OCCUPATION_OPTIONS.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </label>

        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : null}
        {message ? <p className="hint">{message}</p> : null}

        <button type="submit" disabled={busy}>
          {busy ? "保存中…" : "保存する"}
        </button>
      </form>
    </section>
  );
}
