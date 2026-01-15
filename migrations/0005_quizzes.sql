-- Migración: Sistema de Quizzes y Evaluaciones
-- Fecha: 2026-01-05
-- Descripción: Tablas para quizzes, preguntas, respuestas y resultados

-- Tabla de Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  module_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER DEFAULT 70, -- Porcentaje mínimo para aprobar
  time_limit INTEGER, -- Tiempo límite en minutos (NULL = sin límite)
  max_attempts INTEGER DEFAULT 3, -- Intentos máximos (NULL = ilimitado)
  randomize_questions BOOLEAN DEFAULT 0,
  randomize_options BOOLEAN DEFAULT 1,
  show_correct_answers BOOLEAN DEFAULT 1, -- Mostrar respuestas correctas después
  published BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Tabla de Preguntas
CREATE TABLE IF NOT EXISTS quiz_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice', -- multiple_choice, true_false, multiple_select
  points INTEGER DEFAULT 1, -- Puntos por respuesta correcta
  explanation TEXT, -- Explicación de la respuesta correcta
  order_index INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Tabla de Opciones de Respuesta
CREATE TABLE IF NOT EXISTS quiz_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT 0,
  order_index INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);

-- Tabla de Intentos de Quiz
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  score REAL NOT NULL, -- Porcentaje de puntos obtenidos
  points_earned INTEGER NOT NULL,
  total_points INTEGER NOT NULL,
  passed BOOLEAN DEFAULT 0,
  time_taken INTEGER, -- Tiempo tomado en segundos
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  answers TEXT, -- JSON con las respuestas del usuario
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Tabla de Respuestas Individuales (para análisis detallado)
CREATE TABLE IF NOT EXISTS quiz_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attempt_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  selected_options TEXT NOT NULL, -- IDs de opciones seleccionadas (JSON array)
  is_correct BOOLEAN DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  time_spent INTEGER, -- Tiempo en esta pregunta en segundos
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_module ON quizzes(course_id, module_number);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question_id ON quiz_options(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_attempt_id ON quiz_answers(attempt_id);
