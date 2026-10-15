CREATE TABLE IF NOT EXISTS reactions (
  id TEXT PRIMARY KEY NOT NULL,
  story_id TEXT NOT NULL,
  author_key TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('wakaru', 'reference', 'bad')),
  created_at TEXT NOT NULL,
  UNIQUE (story_id, author_key, kind)
);

CREATE INDEX IF NOT EXISTS idx_reactions_story_kind
  ON reactions (story_id, kind);
