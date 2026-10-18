import { describe, expect, it, vi } from "vitest";
import {
  deleteOwnStory,
  StoryForbiddenError,
} from "../src/factors/deleteOwnStory";
import { StoryNotFoundError } from "../src/factors/persistReaction";

describe("deleteOwnStory", () => {
  it("rejects missing story", async () => {
    const first = vi.fn().mockResolvedValue(null);
    const bind = vi.fn().mockReturnValue({ first });
    const prepare = vi.fn().mockReturnValue({ bind });
    const db = { prepare } as unknown as D1Database;

    await expect(deleteOwnStory(db, "missing", "ak")).rejects.toBeInstanceOf(
      StoryNotFoundError,
    );
  });

  it("rejects non-author", async () => {
    const first = vi.fn().mockResolvedValue({
      id: "s1",
      authorKey: "other",
    });
    const bind = vi.fn().mockReturnValue({ first });
    const prepare = vi.fn().mockReturnValue({ bind });
    const db = { prepare } as unknown as D1Database;

    await expect(deleteOwnStory(db, "s1", "ak")).rejects.toBeInstanceOf(
      StoryForbiddenError,
    );
  });

  it("deletes owned story and dependents", async () => {
    const first = vi.fn().mockResolvedValue({ id: "s1", authorKey: "ak" });
    const run = vi.fn().mockResolvedValue({ success: true });
    const bind = vi.fn().mockReturnValue({ first, run });
    const prepare = vi.fn().mockReturnValue({ bind, run });
    const db = { prepare } as unknown as D1Database;

    await deleteOwnStory(db, "s1", "ak");
    expect(prepare).toHaveBeenCalledTimes(6);
    expect(run).toHaveBeenCalledTimes(5);
  });
});
