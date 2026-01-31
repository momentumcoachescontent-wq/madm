ALTER TABLE stories ADD COLUMN slug TEXT;
ALTER TABLE stories ADD COLUMN story_text TEXT;
ALTER TABLE stories ADD COLUMN analysis_text TEXT;
ALTER TABLE stories ADD COLUMN excerpt TEXT;
ALTER TABLE stories ADD COLUMN thumbnail_url TEXT;
ALTER TABLE stories ADD COLUMN published_at TIMESTAMP;

CREATE UNIQUE INDEX IF NOT EXISTS idx_stories_slug ON stories(slug);
