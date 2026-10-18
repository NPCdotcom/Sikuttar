import { describe, it, expect, vi } from "vitest";
import { listMyStories } from "../src/factors/listMyStories";

describe("listMyStories", () => {
  it("queries by author_key with limit", async () => {
    const all = vi.fn().mockResolvedValue({
      results: [
        {
          id: "s1",
          body: "mine",
          situation: null,
          cause: null,
          created_at: "2026-01-01T00:00:00.000Z",
          author_key: "ak",
        },
      ],
    });
    const bind = vi.fn().mockReturnValue({ all });
    const prepare = vi.fn().mockReturnValue({ bind });
    const db = { prepare } as unknown as D1Database;

    const rows = await listMyStories(db, "ak", 10);
    expect(prepare).toHaveBeenCalled();
    expect(String(prepare.mock.calls[0][0])).toContain("author_key = ?");
    expect(bind).toHaveBeenCalledWith("ak", 10);
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe("s1");
  });
});
