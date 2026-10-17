-- Wave2 E11: private bookmarks (linked account only)
CREATE TABLE IF NOT EXISTS bookmarks (
  author_key TEXT NOT NULL,
  story_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (author_key, story_id),
  FOREIGN KEY (story_id) REFERENCES failure_stories(id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_author_created
  ON bookmarks (author_key, created_at DESC);
