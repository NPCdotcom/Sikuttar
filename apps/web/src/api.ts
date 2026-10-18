import {
  withDefaultCounts,
  type PublicStory,
  type ReactionKind,
  type SecretaryAskResult,
} from "./types";

async function readError(res: Response, fallback: string): Promise<string> {
  const payload = (await res.json().catch(() => null)) as { error?: string } | null;
  return payload?.error ?? `${fallback} (${res.status})`;
}

export async function fetchRecommendedTags(): Promise<string[]> {
  const res = await fetch("/tags/recommended", { credentials: "include" });
  if (!res.ok) {
    throw new Error(await readError(res, "タグ候補の取得に失敗しました"));
  }
  const data = (await res.json()) as { items: string[] };
  return data.items ?? [];
}

/** Tags that appear on at least one story (feed filter chips). */
export async function fetchUsedTags(): Promise<string[]> {
  const res = await fetch("/tags", { credentials: "include" });
  if (!res.ok) {
    throw new Error(await readError(res, "タグ一覧の取得に失敗しました"));
  }
  const data = (await res.json()) as { items: string[] };
  return data.items ?? [];
}

export async function fetchStories(tag?: string | null): Promise<PublicStory[]> {
  const url =
    tag && tag.trim()
      ? `/stories?tag=${encodeURIComponent(tag.trim())}`
      : "/stories";
  const res = await fetch(url, { credentials: "include" });
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
  tags?: string[];
}): Promise<void> {
  const res = await fetch("/stories", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      body: input.body,
      situation: input.situation || undefined,
      cause: input.cause || undefined,
      tags: input.tags?.length ? input.tags : undefined,
    }),
  });
  if (!res.ok) {
    throw new Error(await readError(res, "投稿に失敗しました"));
  }
}

export async function deleteStory(storyId: string): Promise<void> {
  const res = await fetch(`/stories/${encodeURIComponent(storyId)}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(await readError(res, "投稿の削除に失敗しました"));
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

export async function fetchSession(): Promise<boolean> {
  const res = await fetch("/auth/session", { credentials: "include" });
  if (!res.ok) {
    throw new Error(await readError(res, "ログイン状態の取得に失敗しました"));
  }
  const data = (await res.json()) as { loggedIn: boolean };
  return data.loggedIn;
}

export async function logoutSession(): Promise<void> {
  const res = await fetch("/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(await readError(res, "ログアウトに失敗しました"));
  }
}

export async function patchAttributes(input: {
  occupation?: string | null;
}): Promise<void> {
  const res = await fetch("/me/attributes", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (res.status === 401) {
    throw new Error("属性を保存するには GitHub ログインが必要です");
  }
  if (!res.ok && res.status !== 204) {
    throw new Error(await readError(res, "属性の保存に失敗しました"));
  }
}

export async function addBookmark(storyId: string): Promise<void> {
  const res = await fetch(
    `/stories/${encodeURIComponent(storyId)}/bookmarks`,
    { method: "POST", credentials: "include" },
  );
  if (res.status === 401) {
    throw new Error("ブックマークするには GitHub ログインが必要です");
  }
  if (!res.ok) {
    throw new Error(await readError(res, "ブックマークの保存に失敗しました"));
  }
}

export async function removeBookmark(storyId: string): Promise<void> {
  const res = await fetch(
    `/stories/${encodeURIComponent(storyId)}/bookmarks`,
    { method: "DELETE", credentials: "include" },
  );
  if (res.status === 401) {
    throw new Error("ブックマークを解除するには GitHub ログインが必要です");
  }
  if (!res.ok) {
    throw new Error(await readError(res, "ブックマークの解除に失敗しました"));
  }
}

export async function fetchBookmarks(): Promise<PublicStory[]> {
  const res = await fetch("/me/bookmarks", { credentials: "include" });
  if (res.status === 401) {
    throw new Error("ブックマークを見るには GitHub ログインが必要です");
  }
  if (!res.ok) {
    throw new Error(await readError(res, "ブックマーク一覧の取得に失敗しました"));
  }
  const data = (await res.json()) as { items: PublicStory[] };
  return data.items.map(withDefaultCounts);
}

export async function fetchMyStories(): Promise<PublicStory[]> {
  const res = await fetch("/me/stories", { credentials: "include" });
  if (res.status === 401) {
    throw new Error("自分の投稿を見るには GitHub ログインが必要です");
  }
  if (!res.ok) {
    throw new Error(await readError(res, "自分の投稿一覧の取得に失敗しました"));
  }
  const data = (await res.json()) as { items: PublicStory[] };
  return data.items.map(withDefaultCounts);
}

export async function fetchSearch(q: string): Promise<PublicStory[]> {
  const query = q.trim();
  if (!query) {
    return [];
  }
  const res = await fetch(`/search?q=${encodeURIComponent(query)}`, {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(await readError(res, "検索に失敗しました"));
  }
  const data = (await res.json()) as { items: PublicStory[] };
  return data.items.map(withDefaultCounts);
}

export async function askSecretary(input: {
  question: string;
  seedStoryId?: string;
}): Promise<SecretaryAskResult> {
  const res = await fetch("/assistant/ask", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: input.question,
      seed_story_id: input.seedStoryId || undefined,
    }),
  });
  if (res.status === 404) {
    throw new Error(
      "質問機能は現在オフです（サーバの SECRETARY_QA=on が必要です）",
    );
  }
  if (!res.ok) {
    throw new Error(await readError(res, "質問の送信に失敗しました"));
  }
  return (await res.json()) as SecretaryAskResult;
}
