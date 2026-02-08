CREATE TABLE IF NOT EXISTS mcp_audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  caller_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  requested_email TEXT,
  status TEXT DEFAULT 'pending',
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
