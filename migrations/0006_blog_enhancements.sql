-- Add scheduled_at to blog_posts
ALTER TABLE blog_posts ADD COLUMN scheduled_at DATETIME;

-- Create blog_post_versions table
CREATE TABLE IF NOT EXISTS blog_post_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_blog_post_versions_post_id ON blog_post_versions(post_id);
