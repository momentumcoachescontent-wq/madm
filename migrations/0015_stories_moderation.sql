ALTER TABLE stories ADD COLUMN moderated_by INTEGER REFERENCES users(id);
ALTER TABLE stories ADD COLUMN moderated_at TIMESTAMP;
ALTER TABLE stories ADD COLUMN moderation_notes TEXT;
ALTER TABLE stories ADD COLUMN file_hash TEXT;
ALTER TABLE stories ADD COLUMN submitter_alias TEXT;
