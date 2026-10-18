import { describe, it, expect } from "vitest";
import { aggregateOccupationHint } from "../src/factors/aggregateOccupationHint";

describe("aggregateOccupationHint", () => {
  it("returns null for empty set", () => {
    expect(aggregateOccupationHint([])).toBeNull();
  });

  it("returns mode when count >= 1/3", () => {
    // 2/3 >= 1/3
    expect(
      aggregateOccupationHint(["学生", "学生", "エンジニア"]),
    ).toBe("学生");
  });

  it("returns null when mode is below 1/3", () => {
    // each 1/4 < 1/3
    expect(
      aggregateOccupationHint(["A", "B", "C", "D"]),
    ).toBeNull();
  });

  it("ignores null/empty in numerator but keeps full denominator", () => {
    // 1 non-empty out of 3 → 1/3 exactly → ok
    expect(aggregateOccupationHint(["学生", null, ""])).toBe("学生");
    // 1 out of 4 → 1/4 < 1/3
    expect(aggregateOccupationHint(["学生", null, null, null])).toBeNull();
  });

  it("boundary: exactly 1/3 passes", () => {
    expect(
      aggregateOccupationHint(["学生", "A", "B"]),
    ).toBe("学生");
  });
});
