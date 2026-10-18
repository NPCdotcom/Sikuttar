import { StoryNotFoundError } from "./persistReaction";

export class StoryForbiddenError extends Error {
  constructor(message = "not the author") {
    super(message);
    this.name = "StoryForbiddenError";
  }
}

/**
 * Delete a failure story owned by authorKey (and related rows).
 */
export async function deleteOwnStory(
  db: D1Database,
  storyId: string,
  authorKey: string,
): Promise<void> {
  const row = await db
    .prepare(
      `SELECT id, author_key AS authorKey FROM failure_stories WHERE id = ?`,
    )
    .bind(storyId)
    .first<{ id: string; authorKey: string }>();

  if (!row) {
    throw new StoryNotFoundError();
  }
  if (row.authorKey !== authorKey) {
    throw new StoryForbiddenError();
  }

  await db
    .prepare(`DELETE FROM story_tags WHERE story_id = ?`)
    .bind(storyId)
    .run();
  await db
    .prepare(`DELETE FROM reactions WHERE story_id = ?`)
    .bind(storyId)
    .run();
  await db
    .prepare(`DELETE FROM bookmarks WHERE story_id = ?`)
    .bind(storyId)
    .run();
  await db
    .prepare(`DELETE FROM failure_stories WHERE id = ? AND author_key = ?`)
    .bind(storyId, authorKey)
    .run();
  await db
    .prepare(
      `DELETE FROM tags WHERE id NOT IN (SELECT tag_id FROM story_tags)`,
    )
    .run();
}
