import type { Env } from "../env";
import {
  aggregateOccupationHint,
  loadOccupationsForAuthorKeys,
} from "./aggregateOccupationHint";
import {
  assembleSecretaryTemplate,
  insufficientSecretaryAnswer,
  type SecretaryEvidenceItem,
} from "./assembleSecretaryTemplate";
import { accountHasSubject } from "./linkAuthSubject";
import { attachAuthorKey } from "./attachAuthorKey";
import { listBookmarks } from "./listBookmarks";
import { loadTagsByStoryIds } from "./loadTagsByStoryIds";
import { searchStories } from "./searchStories";

const FOCUS_LIMIT = 20;
const EVIDENCE_LIMIT = 5;

export type SecretaryAskResult = {
  answer: string;
  evidence: Array<{
    id: string;
    body: string;
    role: "corpus" | "bookmark";
    tags: string[];
  }>;
  attribute_hint?: string;
};

/**
 * E12 orchestration: search focus set → occupation 1/3 → template (no LLM).
 * seedStoryId is accepted but never force-included in the focus set.
 */
export async function askSecretary(
  env: Env,
  question: string,
  options: {
    seedStoryId?: string;
    cookieHeader?: string;
  } = {},
): Promise<SecretaryAskResult> {
  void options.seedStoryId; // accepted for API compat; not force-included

  const q = question.trim();
  if (!q) {
    return {
      answer: insufficientSecretaryAnswer(),
      evidence: [],
    };
  }

  const focus = await searchStories(env, q, FOCUS_LIMIT);
  if (focus.length === 0) {
    return {
      answer: insufficientSecretaryAnswer(),
      evidence: [],
    };
  }

  const tagsMap = await loadTagsByStoryIds(
    env.DB,
    focus.map((r) => r.id),
  );

  let bookmarkedIds = new Set<string>();
  if (options.cookieHeader) {
    const { authorKey } = attachAuthorKey(options.cookieHeader);
    if (await accountHasSubject(env.DB, authorKey)) {
      const bookmarks = await listBookmarks(env.DB, authorKey, 100);
      bookmarkedIds = new Set(bookmarks.map((b) => b.id));
    }
  }

  const ranked = [...focus].sort((a, b) => {
    const aBm = bookmarkedIds.has(a.id) ? 1 : 0;
    const bBm = bookmarkedIds.has(b.id) ? 1 : 0;
    return bBm - aBm;
  });

  const slice = ranked.slice(0, EVIDENCE_LIMIT);
  const evidenceItems: SecretaryEvidenceItem[] = slice.map((row) => ({
    id: row.id,
    body: row.body,
    situation: row.situation,
    cause: row.cause,
    tags: tagsMap.get(row.id) ?? [],
    role: bookmarkedIds.has(row.id) ? "bookmark" : "corpus",
  }));

  const occupations = await loadOccupationsForAuthorKeys(
    env.DB,
    focus.map((r) => r.author_key),
  );
  const attributeHint = aggregateOccupationHint(occupations);

  const answer = assembleSecretaryTemplate({
    attributeHint,
    evidence: evidenceItems,
  });

  const result: SecretaryAskResult = {
    answer,
    evidence: evidenceItems.map((e) => ({
      id: e.id,
      body: e.body,
      role: e.role,
      tags: e.tags,
    })),
  };
  if (attributeHint) {
    result.attribute_hint = attributeHint;
  }
  return result;
}
