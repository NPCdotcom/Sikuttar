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
};

export type AppView = "feed" | "compose" | "detail";

export type ReactionKind = "wakaru" | "reference";

export function withDefaultCounts(item: PublicStory): PublicStory {
  return {
    ...item,
    counts: item.counts ?? { wakaru: 0, reference: 0 },
  };
}
