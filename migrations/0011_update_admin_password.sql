-- Update Admin Password
UPDATE users
SET password_hash = '$2b$10$RzEYY3KbFXku.q5ItvBuoueq3Xf2nDnsOQFm7Edg71Tu.lvXrT4P6', updated_at = datetime('now')
WHERE email = 'admin@masalladelmiedo.com';
