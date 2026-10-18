import type { Env } from "../env";

/** FR25: secretary route is active only when SECRETARY_QA=on. */
export function secretaryQaEnabled(env: Env): boolean {
  return (env.SECRETARY_QA ?? "off").trim().toLowerCase() === "on";
}
