import { describe, expect, it } from "vitest";
import {
  passesQueryFloor,
  passesTokenMatchFloor,
  scoreQueryCoverage,
  scoreStorySimilarity,
  scoreTokenMatch,
} from "../src/factors/scoreStorySimilarity";
import {
  tokenizeForSimilarity,
  tokenizeQueryForFloor,
} from "../src/factors/tokenizeForSimilarity";
import { rankStoriesByTokenQuery } from "../src/factors/rankStoriesByTokenQuery";
import type { StoryRow } from "../src/factors/listByCreatedAtDesc";

describe("scoreTokenMatch", () => {
  it("weights coverage at 0.7 and jaccard at 0.3", () => {
    const q = new Set(["aa", "bb"]);
    const cand = new Set(["aa", "bb", "cc", "dd"]);
    const coverage = scoreQueryCoverage(q, cand); // 1
    const jaccard = scoreStorySimilarity(q, cand); // 2/4 = 0.5
    expect(scoreTokenMatch(q, cand)).toBeCloseTo(0.7 * coverage + 0.3 * jaccard);
  });
});

describe("passesTokenMatchFloor", () => {
  it("requires full coverage for short queries (|Q| <= 2)", () => {
    const q = new Set(["デプロイ"]);
    expect(passesTokenMatchFloor(q, new Set(["デプロイ", "本番"]))).toBe(true);
    expect(passesTokenMatchFloor(q, new Set(["本番", "障害"]))).toBe(false);
  });

  it("keeps coverage >= 0.2 floor for longer queries", () => {
    const q = new Set(["aa", "bb", "cc", "dd", "ee", "ff"]);
    expect(passesTokenMatchFloor(q, new Set(["aa", "zz", "yy", "xx", "ww"]))).toBe(
      false,
    );
    expect(passesTokenMatchFloor(q, new Set(["aa", "bb", "cc"]))).toBe(true);
  });
});

describe("tokenizeQueryForFloor", () => {
  it("omits CJK bigram inflation used by tokenizeForSimilarity", () => {
    const long =
      "デプロイ前の確認を飛ばしてしまったときの学びは？";
    const floor = tokenizeQueryForFloor(long);
    const full = tokenizeForSimilarity(long);
    expect(floor.size).toBeGreaterThan(0);
    expect(floor.size).toBeLessThan(full.size);
    expect([...floor].some((t) => t.includes("デプロイ") || t === "確認")).toBe(
      true,
    );
  });
});

describe("rankStoriesByTokenQuery long questions", () => {
  it("hits a deploy story when the question is a long sentence with that core term", () => {
    const row: StoryRow = {
      id: "s-deploy",
      body: "本番デプロイ前の確認を飛ばして障害を出した",
      situation: "リリース作業",
      cause: "チェックリスト未実施",
      created_at: "2026-10-01T00:00:00.000Z",
      author_key: "ak",
    };
    const hits = rankStoriesByTokenQuery(
      "デプロイ前の確認を飛ばしてしまったときの学びは？",
      [{ row, tags: ["デプロイ"] }],
      5,
    );
    expect(hits.map((h) => h.row.id)).toContain("s-deploy");
  });
});

describe("passesQueryFloor", () => {
  it("accepts surface tokens evidenced via candidate bigrams", () => {
    const floor = new Set(["デプロイ", "確認", "本番"]);
    const cand = tokenizeForSimilarity(
      "本番デプロイ前の確認を飛ばして障害を出した",
    );
    expect(passesQueryFloor(floor, cand)).toBe(true);
  });

  it("legacy bigram floor fails when |Q| is inflated; surface floor still passes", () => {
    const cand = tokenizeForSimilarity(
      "本番デプロイ前の確認を飛ばして障害を出した",
    );
    const surface = new Set(["デプロイ", "確認", "本番"]);
    // One real bigram + many fillers → coverage << 0.2 under legacy floor.
    const inflated = new Set<string>(["デプ"]);
    for (let i = 0; i < 20; i++) {
      inflated.add(`ｘ${i}`);
    }
    expect(passesTokenMatchFloor(inflated, cand)).toBe(false);
    expect(passesQueryFloor(surface, cand)).toBe(true);
  });
});
