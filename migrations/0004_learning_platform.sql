-- Migración para plataforma de aprendizaje completa

-- Tabla de Usuarios/Estudiantes
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'student', -- student, instructor, admin
  active BOOLEAN DEFAULT 1,
  email_verified BOOLEAN DEFAULT 0,
  verification_token TEXT,
  reset_token TEXT,
  reset_token_expires DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Lecciones
CREATE TABLE IF NOT EXISTS lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  module_number INTEGER NOT NULL,
  lesson_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT, -- URL de video (YouTube, Vimeo, o propio)
  video_duration INTEGER, -- Duración en segundos
  content TEXT, -- Contenido adicional en markdown/html
  order_index INTEGER NOT NULL,
  is_preview BOOLEAN DEFAULT 0, -- Si la lección es de vista previa gratuita
  published BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Tabla de Recursos Descargables
CREATE TABLE IF NOT EXISTS lesson_resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lesson_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_type TEXT NOT NULL, -- pdf, docx, xlsx, zip, etc
  file_url TEXT NOT NULL,
  file_size INTEGER, -- Tamaño en bytes
  downloads_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- Tabla de Progreso del Estudiante
CREATE TABLE IF NOT EXISTS student_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  lesson_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  completed BOOLEAN DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- Tiempo en segundos
  last_position INTEGER DEFAULT 0, -- Última posición del video en segundos
  notes TEXT, -- Notas personales del estudiante
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE(user_id, lesson_id)
);

-- Tabla de Inscripciones Pagadas (reemplaza course_enrollments simple)
CREATE TABLE IF NOT EXISTS paid_enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  payment_id TEXT, -- ID de transacción de Stripe
  payment_status TEXT DEFAULT 'pending', -- pending, completed, failed, refunded
  amount_paid REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT, -- card, paypal, etc
  enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME, -- NULL = acceso de por vida
  access_revoked BOOLEAN DEFAULT 0,
  completed BOOLEAN DEFAULT 0,
  completion_date DATETIME,
  certificate_issued BOOLEAN DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE(user_id, course_id)
);

-- Tabla de Certificados
CREATE TABLE IF NOT EXISTS certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  enrollment_id INTEGER NOT NULL,
  certificate_code TEXT UNIQUE NOT NULL,
  issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  certificate_url TEXT,
  verified BOOLEAN DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (enrollment_id) REFERENCES paid_enrollments(id) ON DELETE CASCADE
);

-- Tabla de Sesiones de Usuario
CREATE TABLE IF NOT EXISTS user_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de Transacciones de Pago
CREATE TABLE IF NOT EXISTS payment_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  enrollment_id INTEGER,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL, -- pending, succeeded, failed, refunded
  payment_method_type TEXT,
  card_last4 TEXT,
  card_brand TEXT,
  error_message TEXT,
  metadata TEXT, -- JSON con información adicional
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (enrollment_id) REFERENCES paid_enrollments(id) ON DELETE SET NULL
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_user_id ON student_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_course_id ON student_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_paid_enrollments_user_id ON paid_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_paid_enrollments_course_id ON paid_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_paid_enrollments_payment_status ON paid_enrollments(payment_status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_id ON payment_transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_certificates_code ON certificates(certificate_code);
