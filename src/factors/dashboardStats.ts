export type DashboardStats = {
  totalStories: number;
  last24hStories: number;
  totalWakaru: number;
};

export async function dashboardStats(db: D1Database): Promise<DashboardStats> {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const totalRow = await db
    .prepare(`SELECT COUNT(*) AS n FROM failure_stories`)
    .first<{ n: number }>();
  const dayRow = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM failure_stories WHERE created_at >= ?`,
    )
    .bind(since24h)
    .first<{ n: number }>();
  const wakaruRow = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM reactions WHERE kind = 'wakaru'`,
    )
    .first<{ n: number }>();

  return {
    totalStories: Number(totalRow?.n ?? 0),
    last24hStories: Number(dayRow?.n ?? 0),
    totalWakaru: Number(wakaruRow?.n ?? 0),
  };
}
