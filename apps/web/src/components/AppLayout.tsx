import { useEffect, useState, type ReactNode } from "react";
import type { AppView } from "../types";

type Props = {
  view: AppView;
  onNavigate: (view: AppView) => void;
  loggedIn: boolean | null;
  sessionError: boolean;
  onLogout: () => void;
  children: ReactNode;
};

function isFeedActive(view: AppView): boolean {
  return view === "feed" || view === "detail";
}

export function AppLayout({
  view,
  onNavigate,
  loggedIn,
  sessionError,
  onLogout,
  children,
}: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [view]);

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDrawerOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  function go(next: AppView) {
    setDrawerOpen(false);
    onNavigate(next);
  }

  const nav = (
    <>
      <button
        type="button"
        className="brand sidebar-brand"
        onClick={() => go("dashboard")}
      >
        <span className="brand-name">シクッター</span>
        <span className="brand-tag">しくじったら、シクッター。</span>
      </button>

      <nav className="sidebar-nav" aria-label="メイン">
        <p className="sidebar-heading">メニュー</p>
        <button
          type="button"
          className={view === "dashboard" ? "nav-link active" : "nav-link"}
          onClick={() => go("dashboard")}
        >
          ダッシュボード
        </button>
        <button
          type="button"
          className={isFeedActive(view) ? "nav-link active" : "nav-link"}
          onClick={() => go("feed")}
        >
          フィード
        </button>
        <button
          type="button"
          className={view === "compose" ? "nav-link active" : "nav-link"}
          onClick={() => go("compose")}
        >
          投稿
        </button>
        <button
          type="button"
          className={view === "search" ? "nav-link active" : "nav-link"}
          onClick={() => go("search")}
        >
          検索
        </button>
        <button
          type="button"
          className={view === "assistant" ? "nav-link active" : "nav-link"}
          onClick={() => go("assistant")}
        >
          質問
        </button>
        <button
          type="button"
          className={view === "profile" ? "nav-link active" : "nav-link"}
          onClick={() => go("profile")}
        >
          プロフィール
        </button>
      </nav>

      <div className="sidebar-footer">
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
      </div>
    </>
  );

  return (
    <div className={drawerOpen ? "app drawer-open" : "app"}>
      <header className="mobile-topbar">
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={drawerOpen}
          aria-controls="app-sidebar"
          onClick={() => setDrawerOpen((open) => !open)}
        >
          {drawerOpen ? "閉じる" : "メニュー"}
        </button>
        <button
          type="button"
          className="brand"
          onClick={() => go("dashboard")}
        >
          <span className="brand-name">シクッター</span>
        </button>
      </header>

      {drawerOpen ? (
        <button
          type="button"
          className="drawer-backdrop"
          aria-label="メニューを閉じる"
          onClick={() => setDrawerOpen(false)}
        />
      ) : null}

      <div className="app-shell">
        <aside id="app-sidebar" className="sidebar">
          {nav}
        </aside>
        <main className="shell">
          <div className="main-column">{children}</div>
        </main>
      </div>
    </div>
  );
}
