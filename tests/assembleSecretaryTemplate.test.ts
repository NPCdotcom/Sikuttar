import { describe, it, expect } from "vitest";
import {
  assembleSecretaryTemplate,
  insufficientSecretaryAnswer,
  type SecretaryEvidenceItem,
} from "../src/factors/assembleSecretaryTemplate";

const sample: SecretaryEvidenceItem = {
  id: "s1",
  body: "デプロイをミスした話",
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
    expect(text).toContain("インフラのようなタグ");
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

  it("returns insufficient message for empty evidence", () => {
    expect(
      assembleSecretaryTemplate({ attributeHint: null, evidence: [] }),
    ).toBe(insufficientSecretaryAnswer());
  });
});
