import type { ValidatedStoryInput } from "./validateBody";

export type PersistedStory = {
  id: string;
  body: string;
  situation: string | null;
  cause: string | null;
  createdAt: string;
};

export async function persistFailureStory(
  db: D1Database,
  input: Pick<ValidatedStoryInput, "body" | "situation" | "cause">,
  authorKey: string,
): Promise<PersistedStory> {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO failure_stories (id, body, situation, cause, created_at, author_key)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, input.body, input.situation, input.cause, createdAt, authorKey)
    .run();

  return {
    id,
    body: input.body,
    situation: input.situation,
    cause: input.cause,
    createdAt,
  };
}
