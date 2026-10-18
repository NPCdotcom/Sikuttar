import { describe, it, expect } from "vitest";
import { secretaryQaEnabled } from "../src/factors/secretaryQaEnabled";
import type { Env } from "../src/env";

function env(partial: Partial<Env> = {}): Env {
  return { DB: {} as D1Database, ...partial };
}

describe("secretaryQaEnabled", () => {
  it("defaults to off", () => {
    expect(secretaryQaEnabled(env())).toBe(false);
  });

  it("is true only for on", () => {
    expect(secretaryQaEnabled(env({ SECRETARY_QA: "on" }))).toBe(true);
    expect(secretaryQaEnabled(env({ SECRETARY_QA: "ON" }))).toBe(true);
    expect(secretaryQaEnabled(env({ SECRETARY_QA: "off" }))).toBe(false);
    expect(secretaryQaEnabled(env({ SECRETARY_QA: "yes" }))).toBe(false);
  });
});
