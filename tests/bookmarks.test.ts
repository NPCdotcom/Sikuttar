import { describe, it, expect, vi } from "vitest";
import { addBookmark } from "../src/factors/addBookmark";
import { removeBookmark } from "../src/factors/removeBookmark";
import { StoryNotFoundError } from "../src/factors/persistReaction";

describe("FR18 bookmarks", () => {
  it("rejects missing story", async () => {
    const first = vi.fn().mockResolvedValue(null);
    const bind = vi.fn().mockReturnValue({ first });
    const prepare = vi.fn().mockReturnValue({ bind });
    const db = { prepare } as unknown as D1Database;

    await expect(addBookmark(db, "acc", "missing")).rejects.toBeInstanceOf(
      StoryNotFoundError,
    );
  });

  it("is idempotent when bookmark exists", async () => {
    const first = vi
      .fn()
      .mockResolvedValueOnce({ id: "story-1" })
      .mockResolvedValueOnce({ createdAt: "2026-10-17T00:00:00.000Z" });
    const bind = vi.fn().mockReturnValue({ first, run: vi.fn() });
    const prepare = vi.fn().mockReturnValue({ bind });
    const db = { prepare } as unknown as D1Database;

    const result = await addBookmark(db, "acc", "story-1");
    expect(result).toEqual({
      storyId: "story-1",
      createdAt: "2026-10-17T00:00:00.000Z",
    });
    expect(prepare).toHaveBeenCalledTimes(2);
  });

  it("removeBookmark reports changes", async () => {
    const run = vi.fn().mockResolvedValue({ meta: { changes: 1 } });
    const bind = vi.fn().mockReturnValue({ run });
    const prepare = vi.fn().mockReturnValue({ bind });
    const db = { prepare } as unknown as D1Database;

    expect(await removeBookmark(db, "acc", "story-1")).toBe(true);
  });
});
