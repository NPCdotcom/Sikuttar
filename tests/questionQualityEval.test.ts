import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { rankStoriesByTokenQuery } from "../src/factors/rankStoriesByTokenQuery";
import {
  applyWakaruBoost,
  passesTokenMatchFloor,
  scoreTokenMatch,
} from "../src/factors/scoreStorySimilarity";
import {
  storyTextForSimilarityWithTags,
  tokenizeForSimilarity,
  tokenizeQueryForFloor,
} from "../src/factors/tokenizeForSimilarity";
import { EVAL_MINI_CORPUS } from "./fixtures/eval-mini-corpus";

type EvalQuery = {
  id: string;
  query: string;
  bucket: string;
  expect: "hits" | "empty";
};

type EvalSet = { queries: EvalQuery[] };

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const evalSet = JSON.parse(
  readFileSync(
    join(root, "docs/operations/wave2/question-quality-eval-set.json"),
    "utf8",
  ),
) as EvalSet;

/** Pre-A floor: bigram-inflated query tokens + passesTokenMatchFloor. */
function rankWithLegacyFloor(query: string, limit = 20) {
  const qTokens = tokenizeForSimilarity(query);
  if (qTokens.size === 0) return [];
  const scored = [];
  for (const c of EVAL_MINI_CORPUS) {
    const cand = tokenizeForSimilarity(
      storyTextForSimilarityWithTags(c.row, c.tags ?? []),
    );
    if (!passesTokenMatchFloor(qTokens, cand)) continue;
    const score = applyWakaruBoost(scoreTokenMatch(qTokens, cand), c.wakaru ?? 0);
    if (score > 0) scored.push({ row: c.row, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

function outcome(
  hits: { row: { id: string } }[],
): "hits" | "empty" {
  return hits.length > 0 ? "hits" : "empty";
}

describe("question quality eval set", () => {
  it("after (surface floor): matches expect for all buckets except paraphrase headroom", () => {
    const mismatches: string[] = [];
    for (const q of evalSet.queries) {
      if (q.bucket === "paraphrase") continue; // Free-path headroom → B
      const hits = rankStoriesByTokenQuery(q.query, EVAL_MINI_CORPUS, 5);
      const got = outcome(hits);
      if (got !== q.expect) {
        mismatches.push(`${q.id}: expect=${q.expect} got=${got}`);
      }
    }
    expect(mismatches).toEqual([]);
  });

  it("long bucket: surface |Q| much smaller than bigram |Q|; after still hits", () => {
    const longs = evalSet.queries.filter((q) => q.bucket === "long");
    expect(longs.length).toBeGreaterThanOrEqual(2);

    for (const q of longs) {
      const full = tokenizeForSimilarity(q.query);
      const floor = tokenizeQueryForFloor(q.query);
      expect(floor.size).toBeGreaterThan(0);
      expect(floor.size).toBeLessThan(full.size);
      expect(outcome(rankStoriesByTokenQuery(q.query, EVAL_MINI_CORPUS))).toBe(
        "hits",
      );
    }
  });

  it("records before/after bucket outcomes for the scorecard", () => {
    const rows = evalSet.queries.map((q) => {
      const legacy = outcome(rankWithLegacyFloor(q.query));
      const after = outcome(rankStoriesByTokenQuery(q.query, EVAL_MINI_CORPUS));
      return {
        id: q.id,
        bucket: q.bucket,
        expect: q.expect,
        before: legacy,
        after,
        okAfter: after === q.expect || q.bucket === "paraphrase",
      };
    });
    // After path: non-paraphrase rows must match expect (same as first test).
    expect(rows.filter((r) => !r.okAfter).map((r) => r.id)).toEqual([]);
    // Surface floor shrinks |Q| on every long query (measurable A win).
    for (const q of evalSet.queries.filter((x) => x.bucket === "long")) {
      expect(tokenizeQueryForFloor(q.query).size).toBeLessThan(
        tokenizeForSimilarity(q.query).size,
      );
    }
  });

  it("short queries still hit after floor change", () => {
    for (const q of evalSet.queries.filter((q) => q.bucket === "short")) {
      expect(outcome(rankStoriesByTokenQuery(q.query, EVAL_MINI_CORPUS))).toBe(
        "hits",
      );
    }
  });
});
