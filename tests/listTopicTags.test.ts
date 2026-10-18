import { describe, expect, it, vi } from "vitest";
import { listTopicTags } from "../src/factors/listTopicTags";

describe("listTopicTags", () => {
  it("maps name and count", async () => {
    const all = vi.fn().mockResolvedValue({
      results: [
        { name: "デプロイ", cnt: 3 },
        { name: "テスト", cnt: 1 },
      ],
    });
    const bind = vi.fn().mockReturnValue({ all });
    const prepare = vi.fn().mockReturnValue({ bind });
    const db = { prepare } as unknown as D1Database;

    await expect(
      listTopicTags(db, "2026-01-01T00:00:00.000Z", 5),
    ).resolves.toEqual([
      { name: "デプロイ", count: 3 },
      { name: "テスト", count: 1 },
    ]);
    expect(bind).toHaveBeenCalledWith("2026-01-01T00:00:00.000Z", 5);
  });
});
