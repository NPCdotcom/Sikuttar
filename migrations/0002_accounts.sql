CREATE TABLE IF NOT EXISTS accounts (
  author_key TEXT PRIMARY KEY NOT NULL,
  occupation TEXT,
  attributes_json TEXT,
  created_at TEXT NOT NULL
);
