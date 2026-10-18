import { describe, it, expect, vi, beforeEach } from "vitest";
import { askSecretary } from "../src/factors/askSecretary";
import type { Env } from "../src/env";
import type { StoryRow } from "../src/factors/listByCreatedAtDesc";

vi.mock("../src/factors/searchStories", () => ({
  searchStories: vi.fn(),
}));
vi.mock("../src/factors/loadTagsByStoryIds", () => ({
  loadTagsByStoryIds: vi.fn(),
}));
vi.mock("../src/factors/aggregateOccupationHint", async () => {
  const actual = await vi.importActual<
    typeof import("../src/factors/aggregateOccupationHint")
  >("../src/factors/aggregateOccupationHint");
  return {
    ...actual,
    loadOccupationsForAuthorKeys: vi.fn(),
  };
});
vi.mock("../src/factors/listBookmarks", () => ({
  listBookmarks: vi.fn(),
}));
vi.mock("../src/factors/linkAuthSubject", () => ({
  accountHasSubject: vi.fn(),
}));

import { searchStories } from "../src/factors/searchStories";
import { loadTagsByStoryIds } from "../src/factors/loadTagsByStoryIds";
import { loadOccupationsForAuthorKeys } from "../src/factors/aggregateOccupationHint";
import { accountHasSubject } from "../src/factors/linkAuthSubject";
import { listBookmarks } from "../src/factors/listBookmarks";

const searchStoriesMock = vi.mocked(searchStories);
const loadTagsMock = vi.mocked(loadTagsByStoryIds);
const loadOccMock = vi.mocked(loadOccupationsForAuthorKeys);
const hasSubjectMock = vi.mocked(accountHasSubject);
const listBookmarksMock = vi.mocked(listBookmarks);

function row(partial: Partial<StoryRow> & { id: string }): StoryRow {
  return {
    body: partial.body ?? "本文",
    situation: partial.situation ?? null,
    cause: partial.cause ?? null,
    created_at: partial.created_at ?? "2026-01-01T00:00:00.000Z",
    author_key: partial.author_key ?? "ak1",
    id: partial.id,
  };
}

describe("askSecretary", () => {
  const env = { DB: {} as D1Database, SECRETARY_QA: "on" } as Env;

  beforeEach(() => {
    vi.clearAllMocks();
    hasSubjectMock.mockResolvedValue(false);
    listBookmarksMock.mockResolvedValue([]);
  });

  it("returns insufficient when search is empty", async () => {
    searchStoriesMock.mockResolvedValue([]);
    const result = await askSecretary(env, "未知の話題");
    expect(result.evidence).toEqual([]);
    expect(result.answer).toContain("確認できる根拠が見つかりませんでした");
  });

  it("returns insufficient for blank question", async () => {
    const result = await askSecretary(env, "   ");
    expect(searchStoriesMock).not.toHaveBeenCalled();
    expect(result.evidence).toEqual([]);
  });

  it("builds template with attribute hint when occupations meet 1/3", async () => {
    searchStoriesMock.mockResolvedValue([
      row({ id: "a", cause: "焦り", author_key: "u1" }),
      row({ id: "b", cause: "焦り", author_key: "u2" }),
      row({ id: "c", cause: "別", author_key: "u3" }),
    ]);
    loadTagsMock.mockResolvedValue(
      new Map([
        ["a", ["学習"]],
        ["b", ["学習"]],
        ["c", []],
      ]),
    );
    loadOccMock.mockResolvedValue(["学生", "学生", "社会人"]);

    const result = await askSecretary(env, "テスト勉強");
    expect(result.attribute_hint).toBe("学生");
    expect(result.evidence.length).toBeGreaterThan(0);
    expect(result.answer).toContain("学生の人に良く見られる");
    expect(result.answer).toContain("焦り");
  });

  it("does not force-include seed (search query is question only)", async () => {
    searchStoriesMock.mockResolvedValue([row({ id: "hit" })]);
    loadTagsMock.mockResolvedValue(new Map([["hit", []]]));
    loadOccMock.mockResolvedValue([null]);

    await askSecretary(env, "質問文", { seedStoryId: "seed-only" });
    expect(searchStoriesMock).toHaveBeenCalledWith(env, "質問文", 20);
  });
});
