
import { describe, it, expect, vi } from "vitest";
import { validateAccountAttributes } from "../src/factors/validateAccountAttributes";
import { updateAccountAttributes } from "../src/factors/updateAccountAttributes";

describe("FR13: アカウント属性の入力チェック", () => {
    it("occupationを更新できる", () => {
        const result = validateAccountAttributes({
            occupation: " 学生 ",
        });

        expect(result).toEqual({
            occupation: "学生",
        });
    });

    it("attributesを更新できる", () => {
        const result = validateAccountAttributes({
            attributes: { experience: "初心者" },
        });

        expect(result).toEqual({
            attributes: { experience: "初心者" },
        });
    });

    it("指定していない項目は変更対象にしない", () => {
        const result = validateAccountAttributes({
            occupation: "エンジニア",
        });

        expect(Object.hasOwn(result, "attributes")).toBe(false);
    });

    it("空の更新を拒否する", () => {
        expect(() => validateAccountAttributes({})).toThrow();
    });

    it("不正なoccupationを拒否する", () => {
        expect(() =>
            validateAccountAttributes({ occupation: 123 }),
        ).toThrow();
    });

    it("長すぎるoccupationを拒否する", () => {
        expect(() =>
            validateAccountAttributes({
                occupation: "あ".repeat(101),
            }),
        ).toThrow();
    });

    it("不正なattributesを拒否する", () => {
        expect(() =>
            validateAccountAttributes({
                attributes: { experience: 123 },
            }),
        ).toThrow();
    });

    it("未定義の項目を拒否する", () => {
        expect(() =>
            validateAccountAttributes({
                displayName: "太郎",
            }),
        ).toThrow();
    });
});

describe("FR13: 属性更新のDB処理", () => {
    function createMockDB(changes = 1) {
        const run = vi.fn().mockResolvedValue({
            meta: { changes },
        });

        const bind = vi.fn().mockReturnValue({ run });
        const prepare = vi.fn().mockReturnValue({ bind });

        return {
            db: { prepare } as unknown as D1Database,
            prepare,
            bind,
            run,
        };
    }

    it("occupationだけを更新する", async () => {
        const mock = createMockDB();

        const result = await updateAccountAttributes(
            mock.db,
            "account-123",
            { occupation: "学生" },
        );

        expect(result).toBe(true);
        expect(mock.prepare).toHaveBeenCalledOnce();

        const sql = mock.prepare.mock.calls[0][0] as string;
        expect(sql).toContain("SET occupation = ?");
        expect(sql).not.toContain("attributes_json = ?");
        expect(sql).toContain("auth_subject IS NOT NULL");

        expect(mock.bind).toHaveBeenCalledWith(
            "学生",
            "account-123",
        );
    });

    it("attributesだけを更新する", async () => {
        const mock = createMockDB();

        const result = await updateAccountAttributes(
            mock.db,
            "account-123",
            { attributes: { experience: "初心者" } },
        );

        expect(result).toBe(true);
        expect(mock.bind).toHaveBeenCalledWith(
            '{"experience":"初心者"}',
            "account-123",
        );
    });

    it("nullを指定すると属性を削除する", async () => {
        const mock = createMockDB();

        await updateAccountAttributes(
            mock.db,
            "account-123",
            { occupation: null },
        );

        expect(mock.bind).toHaveBeenCalledWith(
            null,
            "account-123",
        );
    });

    it("更新項目がなければSQLを実行しない", async () => {
        const mock = createMockDB();

        const result = await updateAccountAttributes(
            mock.db,
            "account-123",
            {},
        );

        expect(result).toBe(false);
        expect(mock.prepare).not.toHaveBeenCalled();
    });

    it("DBに更新対象がなければfalseを返す", async () => {
        const mock = createMockDB(0);

        const result = await updateAccountAttributes(
            mock.db,
            "account-123",
            { occupation: "学生" },
        );

        expect(result).toBe(false);
    });
});

