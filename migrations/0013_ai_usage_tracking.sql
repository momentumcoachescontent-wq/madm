CREATE TABLE IF NOT EXISTS daily_ai_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  ip_address TEXT,
  usage_date TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON daily_ai_usage(user_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_ai_usage_ip_date ON daily_ai_usage(ip_address, usage_date);
