-- Actualización de credenciales para Admin y Demo User

-- 1. Admin User
INSERT INTO users (email, name, password_hash, role, active, email_verified)
VALUES ('admin@masalladelmiedo.com', 'Administrador', '$2b$10$Pmyf7BAEDXMB46d6UhqVQ.wkd/Czlr.IZk4qrItGgZ7DSPzCHJks6', 'admin', 1, 1)
ON CONFLICT(email) DO UPDATE SET
    password_hash = excluded.password_hash,
    role = excluded.role,
    active = 1,
    email_verified = 1;

-- 2. Demo User
INSERT INTO users (email, name, password_hash, role, active, email_verified)
VALUES ('demo@masalladelmiedo.com', 'Usuario Demo', '$2b$10$wx8F98Bxod005nGUqQWxHeZC0xv8nOvOABx7zZErOlEAys8y.6Poa', 'student', 1, 1)
ON CONFLICT(email) DO UPDATE SET
    password_hash = excluded.password_hash,
    role = excluded.role,
    active = 1,
    email_verified = 1;
