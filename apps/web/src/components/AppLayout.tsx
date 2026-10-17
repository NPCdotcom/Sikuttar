import { useEffect, useState, type ReactNode } from "react";
import type { AppView } from "../types";
import { fetchSession } from "../api";

type Props = {
  view: AppView;
  onNavigate: (view: AppView) => void;
  children: ReactNode;
};

export function AppLayout({ view, onNavigate, children }: Props) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [sessionError, setSessionError] = useState(false);

  useEffect(() => {
    fetchSession()
      .then(setLoggedIn)
      .catch(() => setSessionError(true));
  }, []);
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <button
            type="button"
            className="brand"
            onClick={() => onNavigate("feed")}
          >
            <span className="brand-name">シクッター</span>
            <span className="brand-tag">しくじったら、シクッター。</span>
          </button>
          <nav className="nav" aria-label="メイン">
            <button
              type="button"
              className={view === "feed" || view === "detail" ? "nav-link active" : "nav-link"}
              onClick={() => onNavigate("feed")}
            >
              フィード
            </button>
            <button
              type="button"
              className={view === "compose" ? "nav-link active" : "nav-link"}
              onClick={() => onNavigate("compose")}
            >
              投稿
            </button>
            <button
              type="button"
              className={view === "profile" ? "nav-link active" : "nav-link"}
              onClick={() => onNavigate("profile")}
            >
              属性設定
            </button>
            {sessionError ? (
              <span className="nav-link">ログイン状態を確認できません</span>
            ) : loggedIn === null ? (
              <span className="nav-link">確認中...</span>
            ) : loggedIn ? (
              <button
                type="button"
                className="nav-link"
                onClick={async () => {
                  try {
                    const res = await fetch("/auth/logout", {
                      method: "POST",
                      credentials: "include",
                    });
                    if (!res.ok) {
                      throw new Error("ログアウトに失敗しました");
                    }
                    setLoggedIn(false);
                  } catch (error) {
                    alert(error instanceof Error ? error.message : "ログアウトに失敗しました");
                  }
                }}
              >
                ログアウト
              </button>
            ) : (
              <button
                type="button"
                className="nav-link"
                onClick={() => window.location.assign("/auth/github")}
              >
                GitHubでログイン
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className="shell">{children}</main>
    </div>
  );
}
