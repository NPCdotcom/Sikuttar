import { withDefaultCounts, type PublicStory, type ReactionKind } from "./types";

async function readError(res: Response, fallback: string): Promise<string> {
  const payload = (await res.json().catch(() => null)) as { error?: string } | null;
  return payload?.error ?? `${fallback} (${res.status})`;
}

export async function fetchStories(): Promise<PublicStory[]> {
  const res = await fetch("/stories", { credentials: "include" });
  if (!res.ok) {
    throw new Error(await readError(res, "一覧の取得に失敗しました"));
  }
  const data = (await res.json()) as { items: PublicStory[] };
  return data.items.map(withDefaultCounts);
}

export async function postStory(input: {
  body: string;
  situation?: string;
  cause?: string;
}): Promise<void> {
  const res = await fetch("/stories", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      body: input.body,
      situation: input.situation || undefined,
      cause: input.cause || undefined,
    }),
  });
  if (!res.ok) {
    throw new Error(await readError(res, "投稿に失敗しました"));
  }
}

export async function postReaction(storyId: string, kind: ReactionKind): Promise<void> {
  const res = await fetch(`/stories/${storyId}/reactions`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind }),
  });
  if (!res.ok && res.status !== 409) {
    throw new Error(await readError(res, "リアクションに失敗しました"));
  }
}

export async function fetchRelated(storyId: string): Promise<PublicStory[]> {
  const res = await fetch(`/stories/${storyId}/related`, { credentials: "include" });
  if (!res.ok) {
    throw new Error(await readError(res, "関連の取得に失敗しました"));
  }
  const data = (await res.json()) as { items: PublicStory[] };
  return data.items.map(withDefaultCounts);
}
