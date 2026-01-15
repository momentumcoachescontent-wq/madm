-- ===== SEED DE CURSOS COMPLETOS =====
-- Este script crea 4 cursos y los asigna al usuario demo

-- Primero, verificar/crear usuario demo
INSERT OR IGNORE INTO users (email, name, password_hash, role, active)
VALUES ('demo@masalladelmiedo.com', 'Usuario Demo', 'demo123_hash', 'student', 1);

-- ===== CURSO 1: Límites Personales y Asertividad =====
INSERT OR IGNORE INTO courses (
  id, title, slug, subtitle, description, 
  featured_image, price, currency, duration_weeks, 
  level, what_you_learn, course_content, requirements, 
  target_audience, published, created_at
) VALUES (
  1,
  'Límites Personales y Asertividad',
  'limites-personales-asertividad',
  'Aprende a establecer límites saludables y comunicarte con asertividad',
  'Este curso te enseñará las habilidades fundamentales para establecer límites personales efectivos, comunicarte de manera asertiva y mantener relaciones saludables. A través de ejercicios prácticos y herramientas comprobadas, aprenderás a decir "no" sin culpa y a expresar tus necesidades con claridad.',
  'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800',
  49.99,
  'USD',
  4,
  'beginner',
  '["Identificar y establecer límites personales claros", "Comunicarte de manera asertiva en cualquier situación", "Decir no sin sentir culpa", "Reconocer y gestionar personas que no respetan límites", "Construir relaciones más saludables y equilibradas"]',
  '[{"module": 1, "title": "Fundamentos de Límites Personales", "lessons": ["¿Qué son los límites personales?", "Por qué los límites son esenciales", "Identificando tus límites actuales"]}, {"module": 2, "title": "Comunicación Asertiva", "lessons": ["Bases de la asertividad", "Técnicas de comunicación efectiva", "Practicando la asertividad"]}]',
  '["Ningún conocimiento previo necesario", "Disposición para reflexionar sobre tus patrones de comunicación", "Compromiso con tu crecimiento personal"]',
  '["Personas que tienen dificultad para decir no", "Quienes desean mejorar sus relaciones personales", "Profesionales que buscan comunicarse mejor", "Cualquiera interesado en su desarrollo personal"]',
  1,
  '2024-01-15 10:00:00'
);

-- ===== CURSO 2: Superando el Miedo al Rechazo =====
INSERT OR IGNORE INTO courses (
  id, title, slug, subtitle, description, 
  featured_image, price, currency, duration_weeks, 
  level, what_you_learn, course_content, requirements, 
  target_audience, published, created_at
) VALUES (
  2,
  'Superando el Miedo al Rechazo',
  'superando-miedo-rechazo',
  'Libérate del miedo al rechazo y vive con mayor autenticidad',
  'El miedo al rechazo puede limitar todas las áreas de tu vida. En este curso profundo y transformador, aprenderás a comprender las raíces de este miedo, desarrollar resiliencia emocional y construir una autoestima sólida que no dependa de la aprobación externa.',
  'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800',
  69.99,
  'USD',
  6,
  'intermediate',
  '["Comprender las causas del miedo al rechazo", "Desarrollar autocompasión y aceptación personal", "Transformar creencias limitantes", "Construir resiliencia emocional", "Tomar decisiones desde tu autenticidad"]',
  '[{"module": 1, "title": "Entendiendo el Miedo al Rechazo", "lessons": ["Orígenes del miedo al rechazo", "Cómo afecta tu vida actual", "Patrones de evitación"]}, {"module": 2, "title": "Construyendo Autoestima Sólida", "lessons": ["Bases de la autoestima", "Autocompasión práctica", "Tu valor inherente"]}, {"module": 3, "title": "Transformación y Práctica", "lessons": ["Enfrentando el miedo", "Viviendo auténticamente", "Plan de acción personal"]}]',
  '["Haber trabajado previamente en límites personales (recomendado)", "Disposición a explorar emociones difíciles", "Compromiso con el proceso de cambio"]',
  '["Personas que evitan situaciones por miedo al rechazo", "Quienes buscan mayor autenticidad", "Emprendedores que temen mostrar su trabajo", "Cualquiera listo para un cambio profundo"]',
  1,
  '2024-02-01 10:00:00'
);

-- ===== CURSO 3: Gestión de Conflictos Constructivos =====
INSERT OR IGNORE INTO courses (
  id, title, slug, subtitle, description, 
  featured_image, price, currency, duration_weeks, 
  level, what_you_learn, course_content, requirements, 
  target_audience, published, created_at
) VALUES (
  3,
  'Gestión de Conflictos Constructivos',
  'gestion-conflictos-constructivos',
  'Transforma los conflictos en oportunidades de crecimiento',
  'Los conflictos son inevitables, pero no tienen que ser destructivos. Este curso te enseña estrategias profesionales para manejar desacuerdos, negociar soluciones ganar-ganar y mantener relaciones sanas incluso en momentos de tensión.',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
  59.99,
  'USD',
  5,
  'intermediate',
  '["Identificar tipos y estilos de conflicto", "Técnicas de escucha activa y empatía", "Negociación y solución de problemas", "Mantener la calma bajo presión", "Convertir conflictos en oportunidades"]',
  '[{"module": 1, "title": "Anatomía del Conflicto", "lessons": ["Tipos de conflictos", "Estilos de manejo", "Tus patrones personales"]}, {"module": 2, "title": "Herramientas de Resolución", "lessons": ["Escucha activa avanzada", "Comunicación no violenta", "Técnicas de negociación"]}, {"module": 3, "title": "Conflictos Difíciles", "lessons": ["Manejo de emociones intensas", "Límites en conflicto", "Cuando alejarse es la respuesta"]}]',
  '["Conocimientos básicos de comunicación asertiva", "Experiencia con situaciones conflictivas", "Apertura a ver los conflictos desde nuevas perspectivas"]',
  '["Líderes y managers", "Parejas que desean mejorar su comunicación", "Profesionales en entornos colaborativos", "Cualquiera que enfrente conflictos regularmente"]',
  1,
  '2024-02-15 10:00:00'
);

-- ===== CURSO 4: Inteligencia Emocional Práctica =====
INSERT OR IGNORE INTO courses (
  id, title, slug, subtitle, description, 
  featured_image, price, currency, duration_weeks, 
  level, what_you_learn, course_content, requirements, 
  target_audience, published, created_at
) VALUES (
  4,
  'Inteligencia Emocional Práctica',
  'inteligencia-emocional-practica',
  'Domina tus emociones y mejora todas tus relaciones',
  'La inteligencia emocional es la clave del éxito personal y profesional. Este curso completo te enseña a reconocer, comprender y gestionar tus emociones y las de otros, desarrollando habilidades que transformarán tu vida.',
  'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=800',
  79.99,
  'USD',
  8,
  'all_levels',
  '["Identificar y nombrar emociones con precisión", "Regular respuestas emocionales efectivamente", "Desarrollar empatía profunda", "Leer señales emocionales en otros", "Aplicar IE en trabajo y relaciones personales"]',
  '[{"module": 1, "title": "Fundamentos de IE", "lessons": ["¿Qué es la inteligencia emocional?", "Los 5 componentes clave", "Evaluando tu IE actual"]}, {"module": 2, "title": "Autoconciencia Emocional", "lessons": ["Reconociendo emociones", "Patrones emocionales", "Diario emocional"]}, {"module": 3, "title": "Autorregulación", "lessons": ["Gestión del estrés", "Control de impulsos", "Técnicas de regulación"]}, {"module": 4, "title": "Habilidades Sociales", "lessons": ["Empatía avanzada", "Comunicación emocional", "Influencia positiva"]}]',
  '["Ningún conocimiento previo necesario", "Interés genuino en el crecimiento personal", "Disposición a practicar diariamente"]',
  '["Profesionales que desean avanzar en sus carreras", "Líderes y emprendedores", "Padres y educadores", "Cualquiera interesado en mejorar sus relaciones"]',
  1,
  '2024-03-01 10:00:00'
);

-- ===== INSCRIBIR USUARIO DEMO EN TODOS LOS CURSOS =====

-- Obtener el ID del usuario demo
-- Curso 1: Límites Personales y Asertividad
INSERT OR REPLACE INTO paid_enrollments (
  user_id, course_id, payment_id, payment_status, 
  amount_paid, currency, payment_method, enrolled_at, expires_at
)
SELECT 
  u.id, 1, 'demo_payment_curso1', 'completed',
  49.99, 'USD', 'demo', datetime('now'), NULL
FROM users u WHERE u.email = 'demo@masalladelmiedo.com';

-- Curso 2: Superando el Miedo al Rechazo
INSERT OR REPLACE INTO paid_enrollments (
  user_id, course_id, payment_id, payment_status, 
  amount_paid, currency, payment_method, enrolled_at, expires_at
)
SELECT 
  u.id, 2, 'demo_payment_curso2', 'completed',
  69.99, 'USD', 'demo', datetime('now'), NULL
FROM users u WHERE u.email = 'demo@masalladelmiedo.com';

-- Curso 3: Gestión de Conflictos Constructivos
INSERT OR REPLACE INTO paid_enrollments (
  user_id, course_id, payment_id, payment_status, 
  amount_paid, currency, payment_method, enrolled_at, expires_at
)
SELECT 
  u.id, 3, 'demo_payment_curso3', 'completed',
  59.99, 'USD', 'demo', datetime('now'), NULL
FROM users u WHERE u.email = 'demo@masalladelmiedo.com';

-- Curso 4: Inteligencia Emocional Práctica
INSERT OR REPLACE INTO paid_enrollments (
  user_id, course_id, payment_id, payment_status, 
  amount_paid, currency, payment_method, enrolled_at, expires_at
)
SELECT 
  u.id, 4, 'demo_payment_curso4', 'completed',
  79.99, 'USD', 'demo', datetime('now'), NULL
FROM users u WHERE u.email = 'demo@masalladelmiedo.com';
