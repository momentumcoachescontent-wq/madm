-- ===== SEED COMPLETO PARA PRODUCCIÓN =====
-- Este script configura todos los datos necesarios para una demostración completa

-- ===== 1. USUARIOS =====

-- 1.1 ADMIN USER
INSERT OR IGNORE INTO users (email, name, password_hash, role, active, email_verified)
VALUES ('admin@masalladelmiedo.com', 'Administrador', '$2b$10$Pmyf7BAEDXMB46d6UhqVQ.wkd/Czlr.IZk4qrItGgZ7DSPzCHJks6', 'admin', 1, 1);

-- Actualizar si ya existe
UPDATE users
SET password_hash = '$2b$10$Pmyf7BAEDXMB46d6UhqVQ.wkd/Czlr.IZk4qrItGgZ7DSPzCHJks6',
    role = 'admin',
    active = 1
WHERE email = 'admin@masalladelmiedo.com';

-- 1.2 DEMO USER
INSERT OR IGNORE INTO users (email, name, password_hash, role, active, email_verified)
VALUES ('demo@masalladelmiedo.com', 'Usuario Demo', '$2b$10$wx8F98Bxod005nGUqQWxHeZC0xv8nOvOABx7zZErOlEAys8y.6Poa', 'student', 1, 1);

-- Actualizar password si ya existe
UPDATE users 
SET password_hash = '$2b$10$wx8F98Bxod005nGUqQWxHeZC0xv8nOvOABx7zZErOlEAys8y.6Poa',
    role = 'student',
    active = 1
WHERE email = 'demo@masalladelmiedo.com';

-- ===== 2. CURSOS =====
-- (Se incluyen los 4 cursos completos del archivo seed_all_courses.sql)

-- ===== 3. LECCIONES =====
-- (Se incluyen las 20 lecciones del archivo seed_lessons.sql)

-- ===== 4. INSCRIPCIONES DEL USUARIO DEMO =====
-- (Se incluyen las 4 inscripciones del archivo seed_all_courses.sql)

-- ===== 5. BLOG POSTS =====
-- (Se incluyen los 10 blog posts del archivo seed_blog_posts.sql)

-- ===== INSTRUCCIONES =====
-- Este archivo debe ser ejecutado junto con:
-- 1. seed_all_courses.sql (cursos e inscripciones)
-- 2. seed_lessons.sql (lecciones)
-- 3. seed_blog_posts.sql (blog)

-- Para aplicar todo en orden:
-- npx wrangler d1 execute mas-alla-del-miedo-db --remote --file=seed_all_courses.sql
-- npx wrangler d1 execute mas-alla-del-miedo-db --remote --file=seed_lessons.sql
-- npx wrangler d1 execute mas-alla-del-miedo-db --remote --file=seed_blog_posts.sql
-- npx wrangler d1 execute mas-alla-del-miedo-db --remote --file=seed_production.sql
