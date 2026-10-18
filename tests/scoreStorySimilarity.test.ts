import { describe, expect, it } from "vitest";
import {
  passesTokenMatchFloor,
  scoreQueryCoverage,
  scoreStorySimilarity,
  scoreTokenMatch,
} from "../src/factors/scoreStorySimilarity";

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
