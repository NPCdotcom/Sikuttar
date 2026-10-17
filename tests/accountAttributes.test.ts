import { describe, it, expect, vi } from "vitest";
import { validateAccountAttributes } from "../src/factors/validateAccountAttributes";
import { updateAccountAttributes } from "../src/factors/updateAccountAttributes";
import { ValidationError } from "../src/factors/validateBody";

describe("FR13: account attributes validation", () => {
  it("trims occupation", () => {
    expect(validateAccountAttributes({ occupation: " 学生 " })).toEqual({
      occupation: "学生",
    });
  });

  it("accepts attributes object", () => {
    expect(
      validateAccountAttributes({ attributes: { experience: "初心者" } }),
    ).toEqual({ attributes: { experience: "初心者" } });
  });

  it("omits unspecified fields", () => {
    const result = validateAccountAttributes({ occupation: "エンジニア" });
    expect(Object.hasOwn(result, "attributes")).toBe(false);
  });

  it("rejects empty patch", () => {
    expect(() => validateAccountAttributes({})).toThrow(ValidationError);
  });

  it("rejects invalid occupation", () => {
    expect(() => validateAccountAttributes({ occupation: 123 })).toThrow(
      ValidationError,
    );
  });

  it("rejects long occupation", () => {
    expect(() =>
      validateAccountAttributes({ occupation: "あ".repeat(101) }),
    ).toThrow(ValidationError);
  });

  it("rejects invalid attributes values", () => {
    expect(() =>
      validateAccountAttributes({ attributes: { experience: 123 } }),
    ).toThrow(ValidationError);
  });

  it("rejects unknown fields", () => {
    expect(() =>
      validateAccountAttributes({ displayName: "太郎" }),
    ).toThrow(ValidationError);
  });
});

describe("FR13: updateAccountAttributes", () => {
  function createMockDB(changes = 1) {
    const run = vi.fn().mockResolvedValue({ meta: { changes } });
    const bind = vi.fn().mockReturnValue({ run });
    const prepare = vi.fn().mockReturnValue({ bind });
    return {
      db: { prepare } as unknown as D1Database,
      prepare,
      bind,
      run,
    };
  }

  it("updates occupation only", async () => {
    const mock = createMockDB();
    const result = await updateAccountAttributes(mock.db, "account-123", {
      occupation: "学生",
    });
    expect(result).toBe(true);
    const sql = mock.prepare.mock.calls[0][0] as string;
    expect(sql).toContain("SET occupation = ?");
    expect(sql).not.toContain("attributes_json = ?");
    expect(sql).toContain("auth_subject IS NOT NULL");
    expect(mock.bind).toHaveBeenCalledWith("学生", "account-123");
  });

  it("updates attributes_json", async () => {
    const mock = createMockDB();
    await updateAccountAttributes(mock.db, "account-123", {
      attributes: { experience: "初心者" },
    });
    expect(mock.bind).toHaveBeenCalledWith(
      '{"experience":"初心者"}',
      "account-123",
    );
  });

  it("allows null occupation", async () => {
    const mock = createMockDB();
    await updateAccountAttributes(mock.db, "account-123", {
      occupation: null,
    });
    expect(mock.bind).toHaveBeenCalledWith(null, "account-123");
  });

  it("skips SQL when empty", async () => {
    const mock = createMockDB();
    expect(await updateAccountAttributes(mock.db, "account-123", {})).toBe(
      false,
    );
    expect(mock.prepare).not.toHaveBeenCalled();
  });

  it("returns false when no row changed", async () => {
    const mock = createMockDB(0);
    expect(
      await updateAccountAttributes(mock.db, "account-123", {
        occupation: "学生",
      }),
    ).toBe(false);
  });
});
