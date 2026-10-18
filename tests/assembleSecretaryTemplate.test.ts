import { describe, it, expect } from "vitest";
import {
  assembleSecretaryTemplate,
  insufficientSecretaryAnswer,
  type SecretaryEvidenceItem,
} from "../src/factors/assembleSecretaryTemplate";

const sample: SecretaryEvidenceItem = {
  id: "s1",
  body: "デプロイをミスした話。チェックリストを導入して再発を防いだ。",
  situation: "本番前に確認しなかった",
  cause: "チェックリスト未整備",
  tags: ["インフラ", "確認不足"],
  role: "corpus",
};

describe("assembleSecretaryTemplate", () => {
  it("omits attribute clause when hint is null", () => {
    const text = assembleSecretaryTemplate({
      attributeHint: null,
      evidence: [sample],
    });
    expect(text).not.toContain("の人に良く見られる");
    expect(text).toContain("チェックリスト未整備");
    expect(text).toContain("#インフラ の失敗談が根拠に多く含まれます");
  });

  it("includes attribute clause when hint present", () => {
    const text = assembleSecretaryTemplate({
      attributeHint: "学生",
      evidence: [sample],
    });
    expect(text.startsWith("このような失敗は、学生の人に良く見られるみたいです。")).toBe(
      true,
    );
  });

  it("mentions bookmark evidence", () => {
    const text = assembleSecretaryTemplate({
      attributeHint: null,
      evidence: [{ ...sample, role: "bookmark" }],
    });
    expect(text).toContain("あなたのブックマーク");
  });

  it("uses body for solution instead of situation", () => {
    const text = assembleSecretaryTemplate({
      attributeHint: null,
      evidence: [sample],
    });
    expect(text).toContain("デプロイをミスした話");
    expect(text).not.toContain("解決の例は本番前に確認しなかった");
  });

  it("skips body that duplicates cause when picking solution", () => {
    const text = assembleSecretaryTemplate({
      attributeHint: null,
      evidence: [
        {
          id: "dup",
          body: "チェックリスト未整備",
          situation: null,
          cause: "チェックリスト未整備",
          tags: ["テスト"],
          role: "corpus",
        },
        {
          id: "next",
          body: "レビュー手順を文書化してから再発しなくなった。",
          situation: null,
          cause: null,
          tags: ["レビュー"],
          role: "corpus",
        },
      ],
    });
    expect(text).toContain("レビュー手順を文書化");
  });

  it("returns insufficient message for empty evidence", () => {
    expect(
      assembleSecretaryTemplate({ attributeHint: null, evidence: [] }),
    ).toBe(insufficientSecretaryAnswer());
  });
});
