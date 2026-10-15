CREATE TABLE IF NOT EXISTS failure_stories (
  id TEXT PRIMARY KEY NOT NULL,
  body TEXT NOT NULL,
  situation TEXT,
  cause TEXT,
  created_at TEXT NOT NULL,
  author_key TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_failure_stories_created_at
  ON failure_stories (created_at DESC);
