import type { ReactNode } from "react";
import type { AppView } from "../types";

type Props = {
  view: AppView;
  onNavigate: (view: AppView) => void;
  loggedIn: boolean | null;
  sessionError: boolean;
  onLogout: () => void;
  children: ReactNode;
};

export function AppLayout({
  view,
  onNavigate,
  loggedIn,
  sessionError,
  onLogout,
  children,
}: Props) {
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
              className={
                view === "feed" || view === "detail" ? "nav-link active" : "nav-link"
              }
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
              className={view === "bookmarks" ? "nav-link active" : "nav-link"}
              onClick={() => onNavigate("bookmarks")}
            >
              保存一覧
            </button>
            <button
              type="button"
              className={view === "profile" ? "nav-link active" : "nav-link"}
              onClick={() => onNavigate("profile")}
            >
              属性設定
            </button>
            {sessionError ? (
              <span className="nav-muted">ログイン状態を確認できません</span>
            ) : loggedIn === null ? (
              <span className="nav-muted">確認中…</span>
            ) : loggedIn ? (
              <button type="button" className="nav-link" onClick={onLogout}>
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
