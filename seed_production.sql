-- ===== SEED COMPLETO PARA PRODUCCIÓN =====
-- Este script configura todos los datos necesarios para una demostración completa

-- ===== 1. USUARIO DEMO =====
INSERT OR IGNORE INTO users (email, name, password_hash, role, active)
VALUES ('demo@masalladelmiedo.com', 'Usuario Demo', '$2b$10$lDrSJBK.rNAn7o4lyJD1hOWzgtakuJEPlqi/zSdqjCykBgCeGrfYm', 'student', 1);

-- Actualizar password si ya existe
UPDATE users 
SET password_hash = '$2b$10$lDrSJBK.rNAn7o4lyJD1hOWzgtakuJEPlqi/zSdqjCykBgCeGrfYm'
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
