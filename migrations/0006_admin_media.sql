-- Tabla para archivos multimedia (simulando storage)
CREATE TABLE IF NOT EXISTS media_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  data BLOB NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insertar usuario admin
INSERT INTO users (name, email, password_hash, role, active, email_verified)
VALUES ('Admin', 'admin@masalladelmiedo.com', '$2b$10$ltjZkMTlukfZtOgWzm5sVes0Jsw/DX9lQUksuw66xaFniijsWeInO', 'admin', 1, 1);
