import { ValidationError } from "./validateBody";

export type AccountAttributesPatch = {
  occupation?: string | null;
  attributes?: Record<string, string> | null;
};

export function validateAccountAttributes(
  input: unknown,
): AccountAttributesPatch {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new ValidationError("invalid attributes body");
  }

  const body = input as Record<string, unknown>;
  const allowedKeys = ["occupation", "attributes"];

  if (
    Object.keys(body).length === 0 ||
    Object.keys(body).some((key) => !allowedKeys.includes(key))
  ) {
    throw new ValidationError("invalid attributes fields");
  }

  const result: AccountAttributesPatch = {};

  if (Object.hasOwn(body, "occupation")) {
    if (body.occupation !== null && typeof body.occupation !== "string") {
      throw new ValidationError("occupation must be a string or null");
    }

    const occupation =
      typeof body.occupation === "string" ? body.occupation.trim() : null;

    if (occupation !== null && occupation.length > 100) {
      throw new ValidationError("occupation is too long");
    }

    result.occupation = occupation;
  }

  if (Object.hasOwn(body, "attributes")) {
    if (body.attributes === null) {
      result.attributes = null;
    } else {
      if (
        typeof body.attributes !== "object" ||
        Array.isArray(body.attributes)
      ) {
        throw new ValidationError("attributes must be an object or null");
      }

      const entries = Object.entries(body.attributes);

      if (
        entries.length > 20 ||
        entries.some(
          ([key, value]) =>
            key.length === 0 ||
            key.length > 50 ||
            typeof value !== "string" ||
            value.length > 200,
        )
      ) {
        throw new ValidationError("invalid attributes");
      }

      result.attributes = Object.fromEntries(entries) as Record<string, string>;
    }
  }

  return result;
}
