export type ReactionKind = "wakaru" | "reference" | "bad";

export const PUBLIC_REACTION_KINDS = ["wakaru", "reference"] as const;
export type PublicReactionKind = (typeof PUBLIC_REACTION_KINDS)[number];

const ALL: ReadonlySet<string> = new Set(["wakaru", "reference", "bad"]);

export class ReactionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReactionValidationError";
  }
}

export function validateReactionKind(payload: unknown): ReactionKind {
  if (!payload || typeof payload !== "object") {
    throw new ReactionValidationError("invalid body");
  }
  const kind = (payload as { kind?: unknown }).kind;
  if (typeof kind !== "string" || !ALL.has(kind)) {
    throw new ReactionValidationError("kind must be wakaru, reference, or bad");
  }
  return kind as ReactionKind;
}
