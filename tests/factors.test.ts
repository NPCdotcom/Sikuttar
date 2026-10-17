import { describe, expect, it } from "vitest";
import { attachAuthorKey, readAuthorKeyFromCookie } from "../src/factors/attachAuthorKey";
import { anonymizeForDisplay } from "../src/factors/anonymizeForDisplay";
import { maskBadFromPublic } from "../src/factors/countPublicReactions";
import { ValidationError, validateBody } from "../src/factors/validateBody";
import {
  ReactionValidationError,
  validateReactionKind,
} from "../src/factors/validateReactionKind";
import {
  applyWakaruBoost,
  scoreStorySimilarity,
} from "../src/factors/scoreStorySimilarity";
import {
  storyTextForSimilarity,
  tokenizeForSimilarity,
} from "../src/factors/tokenizeForSimilarity";

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

describe("githubSubject", () => {
  it("formats github:<id>", async () => {
    const { githubSubjectFromUserId } = await import("../src/factors/githubSubject");
    expect(githubSubjectFromUserId(42)).toBe("github:42");
    expect(() => githubSubjectFromUserId("abc")).toThrow();
  });
});

describe("buildGitHubAuthorizeUrl", () => {
  it("includes client_id, redirect, state", async () => {
    const { buildGitHubAuthorizeUrl } = await import(
      "../src/factors/exchangeGitHubOAuth"
    );
    const url = buildGitHubAuthorizeUrl(
      {
        clientId: "cid",
        clientSecret: "sec",
        redirectUri: "http://127.0.0.1:8787/auth/github/callback",
      },
      "state-1",
    );
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe(
      "https://github.com/login/oauth/authorize",
    );
    expect(parsed.searchParams.get("client_id")).toBe("cid");
    expect(parsed.searchParams.get("state")).toBe("state-1");
    expect(parsed.searchParams.get("redirect_uri")).toContain("/auth/github/callback");
  });
});

describe("exchangeGitHubCodeForSubject", () => {
  it("returns opaque subject without leaking login", async () => {
    const { exchangeGitHubCodeForSubject } = await import(
      "../src/factors/exchangeGitHubOAuth"
    );
    const fetchImpl: typeof fetch = async (input) => {
      const url = String(input);
      if (url.includes("access_token")) {
        return new Response(JSON.stringify({ access_token: "t" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ id: 99, login: "someone" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };
    const subject = await exchangeGitHubCodeForSubject(
      {
        clientId: "cid",
        clientSecret: "sec",
        redirectUri: "http://127.0.0.1:8787/auth/github/callback",
      },
      "code",
      fetchImpl,
    );
    expect(subject).toBe("github:99");
  });
});

describe("similarity factors", () => {
  it("scores overlapping tokens higher", () => {
    const q = tokenizeForSimilarity(
      storyTextForSimilarity({
        body: "デプロイ失敗でロールバックした",
        situation: "本番",
        cause: null,
      }),
    );
    const close = tokenizeForSimilarity(
      storyTextForSimilarity({
        body: "デプロイ失敗で慌ててロールバック",
        situation: "本番",
        cause: null,
      }),
    );
    const far = tokenizeForSimilarity(
      storyTextForSimilarity({
        body: "朝ごはんを食べ忘れた",
        situation: null,
        cause: null,
      }),
    );
    expect(scoreStorySimilarity(q, close)).toBeGreaterThan(scoreStorySimilarity(q, far));
  });

  it("applies wakaru boost without introducing bad", () => {
    expect(applyWakaruBoost(0.5, 2)).toBeCloseTo(0.54);
  });
});
