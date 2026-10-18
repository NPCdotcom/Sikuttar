import { describe, expect, it, vi } from "vitest";
import { dashboardStats } from "../src/factors/dashboardStats";

describe("dashboardStats", () => {
  it("returns counts from D1", async () => {
    const first = vi
      .fn()
      .mockResolvedValueOnce({ n: 10 })
      .mockResolvedValueOnce({ n: 2 })
      .mockResolvedValueOnce({ n: 7 });
    const bind = vi.fn().mockReturnValue({ first });
    const prepare = vi.fn().mockReturnValue({ first, bind });
    const db = { prepare } as unknown as D1Database;

    await expect(dashboardStats(db)).resolves.toEqual({
      totalStories: 10,
      last24hStories: 2,
      totalWakaru: 7,
    });
  });
});
