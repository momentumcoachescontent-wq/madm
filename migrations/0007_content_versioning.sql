-- Migration: Content Versioning System

-- 1. Update blog_post_versions
ALTER TABLE blog_post_versions ADD COLUMN status TEXT DEFAULT 'published';
ALTER TABLE blog_post_versions ADD COLUMN change_summary TEXT;

-- 2. Create course_versions table
CREATE TABLE IF NOT EXISTS course_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  duration_weeks INTEGER,
  level TEXT,
  price REAL,
  currency TEXT,
  featured_image TEXT,
  instructor_name TEXT,
  instructor_bio TEXT,
  what_you_learn TEXT, -- JSON
  course_content TEXT, -- JSON
  requirements TEXT, -- JSON
  target_audience TEXT, -- JSON
  testimonials TEXT, -- JSON
  status TEXT DEFAULT 'draft', -- draft, published, archived
  change_summary TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_course_versions_course_id ON course_versions(course_id);
CREATE INDEX IF NOT EXISTS idx_course_versions_created_at ON course_versions(created_at DESC);

-- 3. Create lesson_versions table
CREATE TABLE IF NOT EXISTS lesson_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lesson_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL, -- Included for easier querying/context
  module_number INTEGER,
  lesson_number INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  video_duration INTEGER,
  content TEXT,
  order_index INTEGER,
  is_preview BOOLEAN,
  status TEXT DEFAULT 'draft', -- draft, published, archived
  change_summary TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_versions_lesson_id ON lesson_versions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_versions_created_at ON lesson_versions(created_at DESC);
