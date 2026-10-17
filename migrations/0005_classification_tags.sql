-- Wave2 E10: classification tags (story ↔ tag many-to-many)
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS story_tags (
  story_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (story_id, tag_id),
  FOREIGN KEY (story_id) REFERENCES failure_stories(id),
  FOREIGN KEY (tag_id) REFERENCES tags(id)
);

CREATE INDEX IF NOT EXISTS idx_story_tags_tag_id
  ON story_tags (tag_id);
