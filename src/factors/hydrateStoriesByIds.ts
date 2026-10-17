import type { StoryRow } from "./listByCreatedAtDesc";

/** Load story rows by id, preserving the order of `ids`. */
export async function hydrateStoriesByIds(
  db: D1Database,
  ids: string[],
): Promise<StoryRow[]> {
  if (ids.length === 0) {
    return [];
  }

  const placeholders = ids.map(() => "?").join(", ");
  const result = await db
    .prepare(
      `SELECT id, body, situation, cause, created_at, author_key
       FROM failure_stories
       WHERE id IN (${placeholders})`,
    )
    .bind(...ids)
    .all<StoryRow>();

  const byId = new Map((result.results ?? []).map((row) => [row.id, row]));
  return ids
    .map((id) => byId.get(id))
    .filter((row): row is StoryRow => row !== undefined);
}
