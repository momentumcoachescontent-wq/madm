-- Tabla de Cursos
CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  duration_weeks INTEGER NOT NULL,
  level TEXT DEFAULT 'Principiante', -- Principiante, Intermedio, Avanzado
  price REAL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  featured_image TEXT,
  instructor_name TEXT,
  instructor_bio TEXT,
  what_you_learn TEXT, -- JSON array de puntos clave
  course_content TEXT, -- JSON array de módulos y lecciones
  requirements TEXT, -- JSON array de requisitos
  target_audience TEXT, -- JSON array de audiencia objetivo
  testimonials TEXT, -- JSON array de testimonios
  published BOOLEAN DEFAULT 1,
  featured BOOLEAN DEFAULT 0,
  enrollment_count INTEGER DEFAULT 0,
  rating REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Módulos de Cursos
CREATE TABLE IF NOT EXISTS course_modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  module_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_hours INTEGER,
  lessons_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Tabla de Inscripciones (para futuro)
CREATE TABLE IF NOT EXISTS course_enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed BOOLEAN DEFAULT 0,
  progress INTEGER DEFAULT 0,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(published);
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_email ON course_enrollments(user_email);
