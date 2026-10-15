import type { StoryRow } from "./listByCreatedAtDesc";

export type PublicStory = {
  id: string;
  body: string;
  situation: string | null;
  cause: string | null;
  createdAt: string;
};

export function anonymizeForDisplay(row: StoryRow): PublicStory {
  return {
    id: row.id,
    body: row.body,
    situation: row.situation,
    cause: row.cause,
    createdAt: row.created_at,
  };
}
