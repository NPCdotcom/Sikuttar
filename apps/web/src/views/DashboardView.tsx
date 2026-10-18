/**
 * Laratter-style home dashboard (placeholder panels · content later).
 */
export function DashboardView() {
  return (
    <section className="view dashboard" aria-label="ダッシュボード">
      <h2>ダッシュボード</h2>
      <p className="hint">概要パネルはこれから埋めていきます。</p>
      <div className="dashboard-grid">
        <div className="dashboard-tile" aria-hidden="true" />
        <div className="dashboard-tile" aria-hidden="true" />
        <div className="dashboard-tile" aria-hidden="true" />
      </div>
      <div className="dashboard-panel" aria-hidden="true" />
    </section>
  );
}
