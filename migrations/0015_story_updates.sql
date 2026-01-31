-- Add columns to stories table
ALTER TABLE stories ADD COLUMN file_hash TEXT;
ALTER TABLE stories ADD COLUMN submitter_alias TEXT;
ALTER TABLE stories ADD COLUMN moderation_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_stories_file_hash ON stories(file_hash);

-- Rate limiting table
CREATE TABLE IF NOT EXISTS api_rate_limits (
    key TEXT PRIMARY KEY, -- e.g., "ip:127.0.0.1:stories_submission"
    count INTEGER DEFAULT 1,
    reset_at INTEGER NOT NULL -- Timestamp when limit resets
);
