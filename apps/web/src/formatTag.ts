/** Display label for classification tags (hashtag-style). */
export function formatHashtag(tag: string): string {
  const t = tag.trim();
  if (!t) return "";
  return t.startsWith("#") ? t : `#${t}`;
}

/** Normalize user input into a bare tag name (no leading #). */
export function bareTagName(input: string): string {
  return input.trim().replace(/^#+/, "").trim();
}
