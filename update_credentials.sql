-- Actualización de credenciales para Admin y Demo User

-- 1. Admin User (Password: Admin123!)
INSERT INTO users (email, name, password_hash, role, active, email_verified)
VALUES ('admin@masalladelmiedo.com', 'Administrador', '$2b$10$6jootGv4ClvcldoMjjBHy.yRHdylPHnAqRSyKBVOI0Z95vv7s56KG', 'admin', 1, 1)
ON CONFLICT(email) DO UPDATE SET
    password_hash = excluded.password_hash,
    role = excluded.role,
    active = 1,
    email_verified = 1;

-- 2. Demo User (Password: demo123)
INSERT INTO users (email, name, password_hash, role, active, email_verified)
VALUES ('demo@masalladelmiedo.com', 'Usuario Demo', '$2b$10$IIP4XvGottp6LM7KGakY/OGdbv0DxyIePXBPQzJujRu1aGtDOzQ6m', 'student', 1, 1)
ON CONFLICT(email) DO UPDATE SET
    password_hash = excluded.password_hash,
    role = excluded.role,
    active = 1,
    email_verified = 1;
