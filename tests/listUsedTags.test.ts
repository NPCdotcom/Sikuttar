import { describe, expect, it, vi } from "vitest";
import { listUsedTags } from "../src/factors/listUsedTags";

describe("listUsedTags", () => {
  it("returns tag names ordered by usage", async () => {
    const all = vi.fn().mockResolvedValue({
      results: [{ name: "デプロイ" }, { name: "レビュー" }],
    });
    const bind = vi.fn().mockReturnValue({ all });
    const prepare = vi.fn().mockReturnValue({ bind });
    const db = { prepare } as unknown as D1Database;

    await expect(listUsedTags(db, 10)).resolves.toEqual([
      "デプロイ",
      "レビュー",
    ]);
    expect(prepare).toHaveBeenCalled();
    expect(bind).toHaveBeenCalledWith(10);
  });
});
