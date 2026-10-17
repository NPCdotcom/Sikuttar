import type { ReactNode } from "react";
import type { AppView } from "../types";

type Props = {
  view: AppView;
  onNavigate: (view: AppView) => void;
  children: ReactNode;
};

export function AppLayout({ view, onNavigate, children }: Props) {
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
          </nav>
        </div>
      </header>
      <main className="shell">{children}</main>
    </div>
  );
}
