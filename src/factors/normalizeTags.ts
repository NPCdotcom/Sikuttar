import { ValidationError } from "./validateBody";

const MAX_TAG_LENGTH = 30;
const MAX_TAG_COUNT = 10;

/** Normalize and validate tag names (FR16 / FR17). */
export function normalizeTags(raw: unknown): string[] {
  if (raw === undefined) {
    return [];
  }
  if (!Array.isArray(raw) || raw.some((tag) => typeof tag !== "string")) {
    throw new ValidationError("tags must be an array of strings");
  }

  const tags = [
    ...new Set(
      (raw as string[])
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
    ),
  ];

  if (tags.some((tag) => tag.length > MAX_TAG_LENGTH)) {
    throw new ValidationError(
      `each tag must be ${MAX_TAG_LENGTH} characters or less`,
    );
  }
  if (tags.length > MAX_TAG_COUNT) {
    throw new ValidationError("too many tags");
  }
  return tags;
}
