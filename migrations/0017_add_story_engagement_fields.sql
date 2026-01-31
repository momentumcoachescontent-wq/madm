-- Add engagement fields to stories table
ALTER TABLE stories ADD COLUMN tags TEXT;
ALTER TABLE stories ADD COLUMN views INTEGER DEFAULT 0;
ALTER TABLE stories ADD COLUMN likes INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_stories_views ON stories(views);
