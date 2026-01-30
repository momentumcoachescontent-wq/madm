-- Fix missing columns in blog_post_versions
ALTER TABLE blog_post_versions ADD COLUMN slug TEXT;
ALTER TABLE blog_post_versions ADD COLUMN hashtags TEXT;
ALTER TABLE blog_post_versions ADD COLUMN scheduled_at DATETIME;
