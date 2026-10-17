import { describe, it, expect, vi } from "vitest";
import { embedText, EmbedTextError } from "../src/factors/embedText";
import { fallbackTokenSearch } from "../src/factors/fallbackTokenSearch";
import { queryVectorIndex } from "../src/factors/queryVectorIndex";
import { searchStories } from "../src/factors/searchStories";
import { canUseVectorize } from "../src/factors/semanticSearchMode";
import { upsertStoryEmbedding } from "../src/factors/upsertStoryEmbedding";
import type { Env } from "../src/env";
import type { StoryRow } from "../src/factors/listByCreatedAtDesc";

function story(
  id: string,
  body: string,
  createdAt = "2026-10-17T00:00:00.000Z",
): StoryRow {
  return {
    id,
    body,
    situation: null,
    cause: null,
    created_at: createdAt,
    author_key: "ak",
  };
}

function mockDbWithStories(rows: StoryRow[]) {
  const all = vi.fn().mockResolvedValue({ results: rows });
  const first = vi.fn().mockResolvedValue(null);
  const bind = vi.fn().mockReturnValue({ all, first, run: vi.fn() });
  const prepare = vi.fn().mockReturnValue({ bind });
  return { db: { prepare } as unknown as D1Database, prepare, bind, all };
}

describe("canUseVectorize", () => {
  it("requires flag and both bindings", () => {
    expect(
      canUseVectorize({
        DB: {} as D1Database,
        SEMANTIC_SEARCH: "vectorize",
      }),
    ).toBe(false);
    expect(
      canUseVectorize({
        DB: {} as D1Database,
        SEMANTIC_SEARCH: "vectorize",
        AI: {} as Ai,
        VECTORIZE: {} as Vectorize,
      }),
    ).toBe(true);
    expect(
      canUseVectorize({
        DB: {} as D1Database,
        SEMANTIC_SEARCH: "fallback",
        AI: {} as Ai,
        VECTORIZE: {} as Vectorize,
      }),
    ).toBe(false);
  });
});

describe("fallbackTokenSearch", () => {
  it("ranks overlapping tokens higher", async () => {
    const rows = [
      story("a", "デプロイに失敗した", "2026-10-17T01:00:00.000Z"),
      story("b", "ランチを食べた", "2026-10-17T02:00:00.000Z"),
      story("c", "本番デプロイ失敗の反省", "2026-10-17T03:00:00.000Z"),
    ];
    const { db, prepare } = mockDbWithStories(rows);
    // first prepare: list stories; second: reaction counts
    prepare.mockReturnValueOnce({
      bind: vi.fn().mockReturnValue({
        all: vi.fn().mockResolvedValue({ results: rows }),
      }),
    });
    prepare.mockReturnValueOnce({
      bind: vi.fn().mockReturnValue({
        all: vi.fn().mockResolvedValue({ results: [] }),
      }),
    });

    const hits = await fallbackTokenSearch(db, "デプロイ 失敗", 10);
    expect(hits.map((h) => h.id)).toEqual(expect.arrayContaining(["a", "c"]));
    expect(hits.map((h) => h.id)).not.toContain("b");
    expect(hits).toHaveLength(2);
  });

  it("returns empty for blank query", async () => {
    const { db } = mockDbWithStories([]);
    expect(await fallbackTokenSearch(db, "  ")).toEqual([]);
  });
});

describe("embedText", () => {
  it("returns first embedding vector", async () => {
    const run = vi.fn().mockResolvedValue({ data: [[0.1, 0.2, 0.3]] });
    const ai = { run } as unknown as Ai;
    await expect(embedText(ai, "hello")).resolves.toEqual([0.1, 0.2, 0.3]);
    expect(run).toHaveBeenCalledWith("@cf/baai/bge-m3", { text: ["hello"] });
  });

  it("throws when empty", async () => {
    const ai = {
      run: vi.fn().mockResolvedValue({ data: [] }),
    } as unknown as Ai;
    await expect(embedText(ai, "x")).rejects.toBeInstanceOf(EmbedTextError);
  });
});

describe("queryVectorIndex", () => {
  it("maps match ids", async () => {
    const query = vi.fn().mockResolvedValue({
      matches: [{ id: "s1", score: 0.9 }, { id: "s2", score: 0.8 }],
    });
    const ids = await queryVectorIndex({ query }, [1, 2], 2);
    expect(ids).toEqual(["s1", "s2"]);
    expect(query).toHaveBeenCalledWith([1, 2], { topK: 2 });
  });
});

describe("searchStories", () => {
  it("uses fallback when SEMANTIC_SEARCH is fallback", async () => {
    const rows = [story("a", "デプロイ失敗")];
    const prepare = vi.fn();
    prepare.mockReturnValueOnce({
      bind: vi.fn().mockReturnValue({
        all: vi.fn().mockResolvedValue({ results: rows }),
      }),
    });
    prepare.mockReturnValueOnce({
      bind: vi.fn().mockReturnValue({
        all: vi.fn().mockResolvedValue({ results: [] }),
      }),
    });
    const env: Env = {
      DB: { prepare } as unknown as D1Database,
      SEMANTIC_SEARCH: "fallback",
    };
    const hits = await searchStories(env, "デプロイ");
    expect(hits.map((h) => h.id)).toEqual(["a"]);
  });

  it("falls back when vectorize flag but unbound", async () => {
    const rows = [story("a", "テスト失敗")];
    const prepare = vi.fn();
    prepare.mockReturnValueOnce({
      bind: vi.fn().mockReturnValue({
        all: vi.fn().mockResolvedValue({ results: rows }),
      }),
    });
    prepare.mockReturnValueOnce({
      bind: vi.fn().mockReturnValue({
        all: vi.fn().mockResolvedValue({ results: [] }),
      }),
    });
    const env: Env = {
      DB: { prepare } as unknown as D1Database,
      SEMANTIC_SEARCH: "vectorize",
    };
    const hits = await searchStories(env, "テスト");
    expect(hits.map((h) => h.id)).toEqual(["a"]);
  });
});

describe("upsertStoryEmbedding", () => {
  it("is a no-op without bindings", async () => {
    const ai = { run: vi.fn() } as unknown as Ai;
    const upsert = vi.fn();
    const env: Env = {
      DB: {} as D1Database,
      SEMANTIC_SEARCH: "fallback",
      AI: ai,
      VECTORIZE: { upsert } as unknown as Vectorize,
    };
    await upsertStoryEmbedding(env, {
      id: "s1",
      body: "本文",
      situation: null,
      cause: null,
    });
    expect(ai.run).not.toHaveBeenCalled();
    expect(upsert).not.toHaveBeenCalled();
  });

  it("embeds and upserts when vectorize is ready", async () => {
    const run = vi.fn().mockResolvedValue({ data: [[0.5, 0.6]] });
    const upsert = vi.fn().mockResolvedValue({ mutationId: "m1" });
    const env: Env = {
      DB: {} as D1Database,
      SEMANTIC_SEARCH: "vectorize",
      AI: { run } as unknown as Ai,
      VECTORIZE: { upsert } as unknown as Vectorize,
    };
    await upsertStoryEmbedding(env, {
      id: "s1",
      body: "デプロイ失敗",
      situation: null,
      cause: null,
    });
    expect(run).toHaveBeenCalled();
    expect(upsert).toHaveBeenCalledWith([
      { id: "s1", values: [0.5, 0.6] },
    ]);
  });
});
