# 📚 Sistema de Gestión de Lecciones

## Descripción General

El sistema de gestión de lecciones permite a los estudiantes acceder y consumir el contenido de los cursos a los que están inscritos, con seguimiento de progreso, notas personales y recursos descargables.

## Características Principales

### 1. Visualización de Lecciones
- **Video Player**: Soporte para videos de YouTube, Vimeo o embeddings personalizados
- **Contenido Rich**: Soporte para HTML/Markdown en el contenido de la lección
- **Recursos Descargables**: PDFs, documentos, archivos ZIP disponibles por lección
- **Breadcrumbs**: Navegación clara desde Dashboard → Curso → Lección

### 2. Control de Acceso
- **Verificación de Inscripción**: Solo estudiantes pagados pueden acceder
- **Verificación de Estado**: Pagos completados y acceso no revocado
- **Redirección Inteligente**: Usuario no autenticado → Login, No inscrito → Página del curso

### 3. Seguimiento de Progreso
- **Marcado Manual**: Botón para marcar lección como completada
- **Progreso Automático**: Actualización del porcentaje del curso
- **Última Posición**: Guardado de posición del video (próxima funcionalidad)
- **Lecciones Completadas**: Checkboxes visuales en el sidebar

### 4. Notas Personales
- **Editor de Notas**: Campo de texto para notas por lección
- **Auto-guardado**: Guardado automático cada 30 segundos
- **Persistencia**: Las notas se guardan en la tabla `student_progress`

### 5. Navegación del Curso
- **Sidebar Fijo**: Lista de todos los módulos y lecciones
- **Indicadores Visuales**: Lección actual, lecciones completadas, previews
- **Navegación Rápida**: Click para saltar a cualquier lección
- **Botones Anterior/Siguiente**: Navegación secuencial entre lecciones

## Estructura de la Base de Datos

### Tabla: `lessons`
```sql
CREATE TABLE IF NOT EXISTS lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  module_number INTEGER NOT NULL,
  lesson_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  video_duration INTEGER,
  content TEXT,
  order_index INTEGER NOT NULL,
  is_preview BOOLEAN DEFAULT 0,
  published BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

### Tabla: `student_progress`
```sql
CREATE TABLE IF NOT EXISTS student_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  lesson_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  completed BOOLEAN DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  last_position INTEGER DEFAULT 0,
  notes TEXT,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE(user_id, lesson_id)
);
```

### Tabla: `lesson_resources`
```sql
CREATE TABLE IF NOT EXISTS lesson_resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lesson_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  downloads_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);
```

## APIs Implementadas

### 1. Ver Lección
```
GET /cursos/:courseSlug/leccion/:lessonId
```

**Funcionalidad:**
- Verifica autenticación del usuario
- Verifica acceso al curso (inscripción pagada)
- Carga información de la lección
- Carga progreso del estudiante
- Carga todas las lecciones del curso para navegación
- Carga recursos descargables de la lección

**Respuesta:**
- HTML con página completa de la lección
- Redirección a `/login` si no está autenticado
- Página de "Acceso Restringido" si no está inscrito

### 2. Marcar Lección como Completada
```
POST /api/lessons/:lessonId/complete
Content-Type: application/json

{
  "completed": true,
  "courseId": 1
}
```

**Funcionalidad:**
- Verifica autenticación y acceso al curso
- Actualiza registro en `student_progress`
- Calcula progreso total del curso
- Actualiza inscripción si el curso está 100% completo

**Respuesta:**
```json
{
  "success": true,
  "progress": 75,
  "completed_lessons": 15,
  "total_lessons": 20
}
```

### 3. Guardar Notas
```
POST /api/lessons/:lessonId/notes
Content-Type: application/json

{
  "notes": "Texto de las notas del estudiante",
  "courseId": 1
}
```

**Funcionalidad:**
- Verifica autenticación y acceso
- Guarda o actualiza notas en `student_progress`
- Upsert automático (crea si no existe)

**Respuesta:**
```json
{
  "success": true
}
```

### 4. Actualizar Progreso del Video
```
POST /api/lessons/:lessonId/progress
Content-Type: application/json

{
  "position": 245,
  "duration": 600,
  "courseId": 1
}
```

**Funcionalidad:**
- Verifica autenticación y acceso
- Guarda última posición del video
- Calcula porcentaje de progreso
- No sobrescribe si la lección ya está marcada como completada

**Respuesta:**
```json
{
  "success": true
}
```

## Integración con el Dashboard

### Dashboard del Estudiante (`/mi-aprendizaje`)

El dashboard ahora incluye:

1. **Detección de Última Lección**: 
   - Query para obtener la última lección vista
   - Fallback a primera lección si no hay progreso

2. **Botón "Continuar Aprendiendo"**:
   - Link directo a la lección adecuada
   - Texto dinámico: "Comenzar Curso" o "Continuar Aprendiendo"

3. **Enlace al Temario**:
   - Botón "Ver Temario" que lleva a la página del curso
   - Permite al estudiante ver todo el contenido

### Página de Detalle del Curso (`/cursos/:slug`)

Actualizaciones:

1. **Verificación de Inscripción**:
   - Detecta si el usuario actual está inscrito
   - Obtiene ID de la primera lección

2. **Botón Inteligente**:
   - Si inscrito: "Comenzar Curso" → Primera lección
   - Si no inscrito: "Comprar ahora" → Checkout

## Flujo de Usuario

### 1. Usuario Nuevo
```
1. Navega a /cursos
2. Ve el catálogo de cursos
3. Click en un curso → /cursos/slug-del-curso
4. Ve detalles y contenido
5. Click en "Comprar ahora" → /checkout/:courseId
6. Completa el pago (Stripe/PayPal)
7. Redirigido a /pago-exitoso
8. Webhook procesa el pago
9. Se crea registro en paid_enrollments
10. Usuario puede acceder a /mi-aprendizaje
11. Click en "Comenzar Curso"
12. Accede a primera lección → /cursos/slug/leccion/1
```

### 2. Usuario Retornando
```
1. Login en /login
2. Navega a /mi-aprendizaje
3. Ve sus cursos con progreso
4. Click en "Continuar Aprendiendo"
5. Va directamente a última lección vista
6. Consume contenido
7. Marca lección como completada
8. Navega a siguiente lección
9. Escribe notas
10. Descarga recursos
```

## Características del Diseño

### Layout Responsive
- **Desktop**: Sidebar fijo a la derecha (350px)
- **Mobile**: Sidebar debajo del contenido principal
- **Grid Layout**: CSS Grid para distribución automática

### Elementos Visuales
- **Progress Bar**: Gradiente púrpura-rosa
- **Checkboxes**: Verde para completadas, gris para pendientes
- **Badges**: "Preview", "Completado", "En Progreso"
- **Icons**: Font Awesome para todos los iconos

### Estados de la Lección
1. **No Iniciada**: Checkbox vacío, fondo blanco
2. **En Progreso**: Sin indicador visual especial
3. **Completada**: Checkbox verde con check, fondo verde claro
4. **Actual**: Border púrpura, fondo lila claro
5. **Preview**: Badge amarillo "Preview"

## Optimizaciones

### Performance
- **Consultas Eficientes**: JOINs optimizados, índices en foreign keys
- **Carga Perezosa**: Solo se cargan lecciones del curso actual
- **Sidebar Sticky**: Usa `position: sticky` en lugar de JavaScript
- **Auto-guardado con Debounce**: 30 segundos para evitar writes excesivos

### UX
- **Feedback Inmediato**: Cambios visuales antes de la respuesta del servidor
- **Auto-save de Notas**: El usuario no necesita hacer click en "Guardar"
- **Navegación Intuitiva**: Botones claros, breadcrumbs, indicadores visuales
- **Redirecciones Inteligentes**: Usuarios no autenticados van a login, no inscritos a página del curso

## Próximas Funcionalidades

### Corto Plazo
- [ ] **Video Progress Tracking**: Guardar posición automáticamente cada 10s
- [ ] **Comentarios/Discusión**: Q&A por lección
- [ ] **Marcadores/Timestamps**: Guardar momentos clave del video
- [ ] **Descarga de Recursos**: Tracking de descargas por recurso

### Mediano Plazo
- [ ] **Quizzes/Evaluaciones**: Tests al final de módulos
- [ ] **Certificados Automáticos**: Generar al completar 100%
- [ ] **Transcripciones**: Texto del video para búsqueda
- [ ] **Velocidad de Playback**: Control de velocidad del video
- [ ] **Subtítulos**: Soporte multi-idioma

### Largo Plazo
- [ ] **Video Nativo**: Hosting propio en Cloudflare Stream
- [ ] **Live Sessions**: Integración con Zoom/Meet
- [ ] **Peer Review**: Comentarios entre estudiantes
- [ ] **Gamificación**: Puntos, badges, leaderboards
- [ ] **Comunidad por Curso**: Foro privado para inscritos

## Testing Local

### 1. Crear Usuario Demo
```sql
INSERT INTO users (email, password_hash, name, role, active, email_verified)
VALUES ('demo@masalladelmiedo.com', 'demo123', 'Usuario Demo', 'student', 1, 1);

INSERT INTO paid_enrollments (
  user_id, 
  course_id, 
  payment_status, 
  amount_paid
)
SELECT 
  (SELECT id FROM users WHERE email = 'demo@masalladelmiedo.com'),
  1,
  'completed',
  0.00;
```

### 2. Login y Navegación
```bash
# Login
curl -c cookies.txt -X POST http://localhost:3000/api/login \
  -d "email=demo@masalladelmiedo.com" \
  -d "password=demo123"

# Ver Dashboard
curl -b cookies.txt http://localhost:3000/mi-aprendizaje

# Ver Lección
curl -b cookies.txt http://localhost:3000/cursos/limites-personales-asertividad/leccion/1

# Marcar Completa
curl -b cookies.txt -X POST http://localhost:3000/api/lessons/1/complete \
  -H "Content-Type: application/json" \
  -d '{"completed":true,"courseId":1}'
```

## Consultas SQL Útiles

### Ver Progreso de un Estudiante
```sql
SELECT 
  c.title as curso,
  COUNT(l.id) as total_lecciones,
  SUM(CASE WHEN sp.completed = 1 THEN 1 ELSE 0 END) as completadas,
  ROUND(CAST(SUM(CASE WHEN sp.completed = 1 THEN 1 ELSE 0 END) AS REAL) / COUNT(l.id) * 100, 2) as porcentaje
FROM courses c
JOIN lessons l ON c.id = l.course_id
LEFT JOIN student_progress sp ON l.id = sp.lesson_id AND sp.user_id = ?
WHERE c.id = ?
GROUP BY c.id;
```

### Ver Lecciones con Más Notas
```sql
SELECT 
  l.title,
  c.title as curso,
  COUNT(sp.notes) as estudiantes_con_notas,
  AVG(LENGTH(sp.notes)) as promedio_largo_notas
FROM lessons l
JOIN courses c ON l.course_id = c.id
LEFT JOIN student_progress sp ON l.id = sp.lesson_id AND sp.notes IS NOT NULL
GROUP BY l.id
ORDER BY estudiantes_con_notas DESC
LIMIT 10;
```

### Ver Recursos Más Descargados
```sql
SELECT 
  lr.title,
  l.title as leccion,
  c.title as curso,
  lr.downloads_count,
  lr.file_type
FROM lesson_resources lr
JOIN lessons l ON lr.lesson_id = l.id
JOIN courses c ON l.course_id = c.id
ORDER BY lr.downloads_count DESC
LIMIT 20;
```

## Troubleshooting

### Problema: No puedo acceder a una lección
**Solución:**
1. Verifica que estás autenticado (cookie de sesión)
2. Verifica que tienes una inscripción activa:
```sql
SELECT * FROM paid_enrollments 
WHERE user_id = ? AND course_id = ? 
AND payment_status = 'completed' AND access_revoked = 0;
```

### Problema: Las notas no se guardan
**Solución:**
1. Verifica que el endpoint `/api/lessons/:id/notes` responde 200
2. Verifica que tienes acceso al curso
3. Check browser console para errores JavaScript

### Problema: El progreso no se actualiza
**Solución:**
1. Verifica que el botón "Marcar Completa" funciona (Network tab)
2. Verifica la tabla `student_progress`:
```sql
SELECT * FROM student_progress WHERE user_id = ? AND lesson_id = ?;
```
3. Verifica que la función `getCourseProgress()` en `auth-utils.ts` funciona

### Problema: Video no carga
**Solución:**
1. Verifica que el `video_url` está en formato embed
2. Para YouTube: `https://www.youtube.com/embed/VIDEO_ID`
3. Para Vimeo: `https://player.vimeo.com/video/VIDEO_ID`
4. Verifica CORS y iFrame permissions

## Estadísticas

- **Líneas de Código Nuevas**: ~750 líneas
- **Nuevas Rutas**: 4 (1 página + 3 APIs)
- **Queries SQL**: 10+ optimizadas
- **Componentes UI**: Sidebar, Breadcrumbs, Progress Bar, Notes Editor
- **Archivos Modificados**: 1 (`src/index.tsx`)
- **Tiempo de Implementación**: ~2 horas
- **Coverage**: Autenticación, Autorización, Progreso, Notas, Navegación

---

**Última actualización**: 2 de Enero de 2026  
**Versión**: 1.0  
**Estado**: ✅ Implementado y Funcional
