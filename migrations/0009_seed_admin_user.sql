-- Seed Admin User
INSERT OR IGNORE INTO users (name, email, password_hash, role, active, email_verified)
VALUES (
  'Admin',
  'admin@masalladelmiedo.com',
  '$2b$10$JnoD1TfTndN0zfJUyB0x9OI9k6Ord1MfC6zAttzD7CAHydTJTodk.',
  'admin',
  1,
  1
);
