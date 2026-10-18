export type PublicCounts = {
  wakaru: number;
  reference: number;
};

export type PublicStory = {
  id: string;
  body: string;
  situation: string | null;
  cause: string | null;
  createdAt: string;
  counts: PublicCounts;
  tags: string[];
};

export type AppView =
  | "feed"
  | "compose"
  | "detail"
  | "profile"
  | "bookmarks"
  | "search"
  | "assistant";

export type SecretaryEvidence = {
  id: string;
  body: string;
  role: "corpus" | "bookmark";
  tags: string[];
};

export type SecretaryAskResult = {
  answer: string;
  evidence: SecretaryEvidence[];
  attribute_hint?: string;
};
export type ReactionKind = "wakaru" | "reference";

export function withDefaultCounts(item: PublicStory): PublicStory {
  return {
    ...item,
    counts: item.counts ?? { wakaru: 0, reference: 0 },
    tags: item.tags ?? [],
  };
}
