import { describe, expect, it } from "vitest";
import { attachAuthorKey, readAuthorKeyFromCookie } from "../src/factors/attachAuthorKey";
import { anonymizeForDisplay } from "../src/factors/anonymizeForDisplay";
import { maskBadFromPublic } from "../src/factors/countPublicReactions";
import { ValidationError, validateBody } from "../src/factors/validateBody";
import {
  ReactionValidationError,
  validateReactionKind,
} from "../src/factors/validateReactionKind";

describe("validateBody", () => {
  it("requires body", () => {
    expect(() => validateBody({ situation: "x" })).toThrow(ValidationError);
  });

  it("allows missing situation and cause", () => {
    expect(validateBody({ body: " failed " })).toEqual({
      body: "failed",
      situation: null,
      cause: null,
    });
  });
});

describe("attachAuthorKey", () => {
  it("reuses cookie author_key", () => {
    const { authorKey, setCookie } = attachAuthorKey("author_key=abc-123");
    expect(authorKey).toBe("abc-123");
    expect(setCookie).toBeNull();
  });

  it("creates author_key when missing", () => {
    const { authorKey, setCookie } = attachAuthorKey(undefined);
    expect(authorKey.length).toBeGreaterThan(0);
    expect(setCookie).toContain("author_key=");
    expect(readAuthorKeyFromCookie(setCookie ?? undefined)).toBe(authorKey);
  });
});

describe("anonymizeForDisplay", () => {
  it("drops author_key", () => {
    const publicStory = anonymizeForDisplay({
      id: "1",
      body: "b",
      situation: null,
      cause: null,
      created_at: "2026-10-15T00:00:00.000Z",
      author_key: "secret",
    });
    expect(publicStory).toEqual({
      id: "1",
      body: "b",
      situation: null,
      cause: null,
      createdAt: "2026-10-15T00:00:00.000Z",
    });
    expect(publicStory).not.toHaveProperty("author_key");
    expect(publicStory).not.toHaveProperty("authorKey");
    expect(publicStory).not.toHaveProperty("occupation");
    expect(publicStory).not.toHaveProperty("attributes");
    expect(publicStory).not.toHaveProperty("attributes_json");
  });
});

describe("validateReactionKind", () => {
  it("accepts wakaru, reference, and bad", () => {
    expect(validateReactionKind({ kind: "wakaru" })).toBe("wakaru");
    expect(validateReactionKind({ kind: "reference" })).toBe("reference");
    expect(validateReactionKind({ kind: "bad" })).toBe("bad");
  });

  it("rejects other kinds", () => {
    expect(() => validateReactionKind({ kind: "like" })).toThrow(ReactionValidationError);
  });
});

describe("maskBadFromPublic", () => {
  it("returns only wakaru and reference", () => {
    const counts = maskBadFromPublic({ wakaru: 2, reference: 1 });
    expect(counts).toEqual({ wakaru: 2, reference: 1 });
    expect(counts).not.toHaveProperty("bad");
  });
});
