
import type { AccountAttributesPatch } from "./validateAccountAttributes";

/**
 * 指定された属性だけを更新する。
 * 認証・認可は呼び出し側で別途検証する。
 */
export async function updateAccountAttributes(
    db: D1Database,
    authorKey: string,
    data: AccountAttributesPatch,
): Promise<boolean> {
    const updates: string[] = [];
    const values: (string | null)[] = [];

    if (data.occupation !== undefined) {
        updates.push("occupation = ?");
        values.push(data.occupation);
    }

    if (data.attributes !== undefined) {
        updates.push("attributes_json = ?");
        values.push(
            data.attributes === null
                ? null
                : JSON.stringify(data.attributes),
        );
    }

    if (updates.length === 0) {
        return false;
    }

    const result = await db
        .prepare(
            `UPDATE accounts
       SET ${updates.join(", ")}
       WHERE author_key = ?
         AND auth_subject IS NOT NULL`,
        )
        .bind(...values, authorKey)
        .run();

    return (result.meta.changes ?? 0) > 0;
}
