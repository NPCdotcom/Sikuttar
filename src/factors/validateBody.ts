import { normalizeTags } from "./normalizeTags";

export type StoryInput = {
  body: string;
  situation?: string;
  cause?: string;
  tags?: string[];
};

export type ValidatedStoryInput = {
  body: string;
  situation: string | null;
  cause: string | null;
  tags: string[];
};

export function validateBody(input: unknown): ValidatedStoryInput {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new ValidationError("request body must be an object");
  }

  const record = input as Record<string, unknown>;
  const body = typeof record.body === "string" ? record.body.trim() : "";
  if (!body) {
    throw new ValidationError("body is required");
  }

  const situation =
    typeof record.situation === "string" && record.situation.trim()
      ? record.situation.trim()
      : null;
  const cause =
    typeof record.cause === "string" && record.cause.trim()
      ? record.cause.trim()
      : null;

  const tags = normalizeTags(record.tags);
  return { body, situation, cause, tags };
}

export class ValidationError extends Error {
  readonly status = 400;
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
