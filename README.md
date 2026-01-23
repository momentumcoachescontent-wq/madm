# Más Allá del Miedo

## 🌟 Resumen del Proyecto

**Más Allá del Miedo** es un ecosistema educativo y de acompañamiento emocional diseñado para adolescentes y adultos jóvenes. El proyecto combina un libro, cursos online, recursos gratuitos y una comunidad de apoyo para ayudar a los jóvenes a:

- Entender sus emociones y construir autoconciencia
- Detectar y protegerse de manipulación emocional
- Usar herramientas psicológicas de forma ética
- Liderar su propia vida con claridad, límites y poder personal

---

## 🚀 URLs del Proyecto

### ✨ Producción (Cloudflare Pages)
- **🌐 URL Principal**: <https://cab283a2.mas-alla-del-miedo.pages.dev>
- **🌐 URL Alternativa**: <https://mas-alla-del-miedo.pages.dev>
- **Estado**: ✅ **ACTIVO Y DESPLEGADO**
- **CDN Global**: Cloudflare Edge Network
- **Base de Datos**: D1 (SQLite global)
- **Última Actualización**: 2024-12-29

### Desarrollo Local (Sandbox)
- **URL Sandbox**: <https://3000-i5ufb1dp5fddctw1qd1fo-82b888ba.sandbox.novita.ai>
- **Puerto Local**: <http://localhost:3000>

### Páginas Implementadas (Fase 1 + Fase 2 + Fase 3 + Fase 4)
✅ **Inicio** (`/`) - Hero principal con propuesta de valor  
✅ **El Libro** (`/el-libro`) - Información detallada del libro con contenido del PDF  
✅ **Método** (`/metodo`) - Las 5 etapas del método "Más Allá del Miedo"  
✅ **Recursos Gratuitos** (`/recursos-gratuitos`) - Lead magnets con formularios funcionales  
✅ **Contacto** (`/contacto`) - Formulario de contacto funcional con D1  
✅ **Login** (`/login`) - Página de inicio de sesión con autenticación  
✅ **Registro** (`/registro`) - Página de registro de nuevos usuarios  
✅ **Mi Aprendizaje** (`/mi-aprendizaje`) - Dashboard del estudiante con cursos inscritos y progreso  
✅ **Cursos** (`/cursos`) - Listado completo de cursos disponibles  
✅ **Detalle de Curso** (`/cursos/:slug`) - Página individual de cada curso con botón "Comprar ahora"  
✅ **Visualización de Lección** (`/cursos/:slug/leccion/:id`) - **Página completa de lección con video, contenido, notas y recursos**  
✅ **Checkout** (`/checkout/:courseId`) - Sistema de pago con Stripe y PayPal  
✅ **Pago Exitoso** (`/pago-exitoso`) - Confirmación de compra exitosa  
✅ **Comunidad** (`/comunidad`) - Información sobre la comunidad y acceso  
✅ **Blog** (`/blog`) - Artículos educativos sobre psicología emocional  
✅ **Sobre Nosotros** (`/sobre-nosotros`) - Historia del proyecto y el autor  

### API Endpoints Funcionales
✅ `POST /api/contact` - Guardar mensajes de contacto en D1  
✅ `POST /api/subscribe` - Capturar leads de recursos gratuitos en D1  
✅ `POST /api/register` - Registro de nuevos usuarios con hash de contraseñas  
✅ `POST /api/login` - Autenticación de usuarios con sesiones  
✅ `POST /api/logout` - Cerrar sesión de usuario  
✅ `GET /api/me` - Verificar sesión actual del usuario  
✅ `POST /api/create-payment-intent` - Crear intención de pago con Stripe  
✅ `POST /api/verify-payment` - Verificar y completar pago de Stripe  
✅ `POST /api/create-paypal-order` - Crear orden de pago con PayPal  
✅ `POST /api/capture-paypal-order` - Capturar y completar pago de PayPal  
✅ `POST /api/webhooks/stripe` - Webhook para eventos de Stripe  
✅ `POST /api/webhooks/paypal` - Webhook para IPN de PayPal  
✅ `POST /api/lessons/:id/complete` - **Marcar lección como completada**  
✅ `POST /api/lessons/:id/notes` - **Guardar notas personales de lección**  
✅ `POST /api/lessons/:id/progress` - **Actualizar progreso del video**  

---

## 🎯 Funcionalidades Actuales

### ✅ Completadas (Fase 1 + Fase 2 + Fase 3 + Fase 4 + Fase 5)
1. **Sitio web responsive** con diseño moderno y juvenil
2. **Base de datos D1** configurada para contactos, suscripciones, usuarios, pagos y progreso
3. **Formularios funcionales** con validación y feedback
4. **Navegación completa** con header fijo y footer informativo
5. **Sistema de diseño consistente** con colores cálidos y profesionales
6. **Contenido real del libro** extraído del PDF proporcionado
7. **Estructura del Método** en 5 etapas claramente presentadas
8. **Sistema de autenticación completo** (registro, login, logout, sesiones)
9. **Dashboard de estudiante** con progreso de cursos y acceso directo a lecciones
10. **Todas las páginas principales** implementadas y funcionales
11. **🎉 Sistema de pagos completo con Stripe y PayPal**
12. **💳 Checkout con selección de método de pago**
13. **✅ Verificación de pagos y creación automática de inscripciones**
14. **📊 Registro de transacciones en base de datos**
15. **🔔 Webhooks de Stripe y PayPal para eventos asíncronos**
16. **🔄 Manejo automático de reembolsos y disputas**
17. **📚 Sistema completo de gestión de lecciones**
18. **🎬 Visualización de lecciones con video player integrado**
19. **📝 Notas personales por lección con auto-guardado**
20. **📥 Recursos descargables por lección**
21. **✅ Seguimiento de progreso por lección y curso**
22. **🗂️ Navegación inteligente entre lecciones**
23. **🎯 Control de acceso basado en inscripciones pagadas**
24. **🎓 4 Cursos completos con 20 lecciones**
25. **👤 Usuario demo con acceso a todos los cursos**

### 📚 Cursos Disponibles
1. **Límites Personales y Asertividad** (6 lecciones) - $49.99
2. **Superando el Miedo al Rechazo** (6 lecciones) - $69.99
3. **Gestión de Conflictos Constructivos** (4 lecciones) - $59.99
4. **Inteligencia Emocional Práctica** (4 lecciones) - $79.99

### 👤 Usuario Demo
- **Email**: <demo@masalladelmiedo.com>
- **Contraseña**: demo123
- **Cursos inscritos**: Todos (4 cursos, 20 lecciones)
- **Estado de pago**: Completado

### ⏳ Pendientes (Fase 6)
- Video hosting propio con Cloudflare Stream
- Quizzes y evaluaciones por módulo
- Certificados automáticos al completar cursos
- Transcripciones de video para accesibilidad
- Integración con Discord para comunidad
- Sistema de gamificación (puntos, badges)
- Comentarios y discusiones por lección

---

## 📊 Arquitectura de Datos

### Base de Datos D1 (SQLite en Producción)
- **Nombre**: mas-alla-del-miedo-db
- **ID**: 4e3ef353-1198-4cd5-b415-a70e817b0b22
- **Región**: ENAM (Eastern North America)
- **Status**: ✅ Activa con migraciones aplicadas

#### Tabla: `contacts`
Almacena mensajes del formulario de contacto
```sql
- id: INTEGER PRIMARY KEY
- name: TEXT (nombre completo)
- email: TEXT (correo electrónico)
- subject: TEXT (asunto/categoría)
- message: TEXT (mensaje completo)
- created_at: DATETIME (fecha de creación)
```

#### Tabla: `subscribers`
Almacena suscriptores a recursos gratuitos
```sql
- id: INTEGER PRIMARY KEY
- name: TEXT (nombre completo)
- email: TEXT UNIQUE (correo electrónico único)
- resource_requested: TEXT (recurso solicitado)
- created_at: DATETIME (fecha de suscripción)
```

**Consultar datos en producción:**
```bash
# Listar contactos
npx wrangler d1 execute mas-alla-del-miedo-db --remote --command="SELECT * FROM contacts"

# Listar suscriptores
npx wrangler d1 execute mas-alla-del-miedo-db --remote --command="SELECT * FROM subscribers"
```

---

## 📚 Sistema de Gestión de Lecciones

El sistema completo de lecciones permite a los estudiantes consumir el contenido de los cursos con seguimiento de progreso, notas personales y recursos descargables.

### Características Principales
- **Video Player**: Soporte para YouTube, Vimeo y embeddings personalizados
- **Navegación Inteligente**: Sidebar con lista completa de lecciones y módulos
- **Seguimiento de Progreso**: Marcado manual y actualización automática del porcentaje
- **Notas Personales**: Editor con auto-guardado cada 30 segundos
- **Recursos Descargables**: PDFs, documentos y archivos por lección
- **Control de Acceso**: Solo estudiantes con inscripción pagada activa
- **Breadcrumbs**: Navegación clara desde Dashboard → Curso → Lección
- **Indicadores Visuales**: Checkboxes, progress bars, badges de estado

### Flujo de Usuario
1. Login → `/login`
2. Dashboard → `/mi-aprendizaje` (ver cursos con progreso)
3. Click "Continuar Aprendiendo" → `/cursos/slug/leccion/id`
4. Ver video, leer contenido, tomar notas
5. Marcar lección como completada
6. Navegar a siguiente lección
7. Descargar recursos adicionales

### Base de Datos
```sql
-- Tabla de lecciones
lessons (id, course_id, module_number, lesson_number, title, 
         description, video_url, video_duration, content, 
         order_index, is_preview, published)

-- Progreso del estudiante
student_progress (id, user_id, lesson_id, course_id, 
                 completed, progress_percentage, time_spent, 
                 last_position, notes, completed_at)

-- Recursos descargables
lesson_resources (id, lesson_id, title, description, 
                 file_type, file_url, file_size, downloads_count)
```

### APIs de Lecciones
- `POST /api/lessons/:id/complete` - Marcar como completada
- `POST /api/lessons/:id/notes` - Guardar notas
- `POST /api/lessons/:id/progress` - Actualizar posición del video

**📖 Documentación completa**: Ver [LECCIONES.md](./LECCIONES.md)

---

## 🛠️ Stack Tecnológico

- **Framework Backend**: Hono (v4.10.7)
- **Plataforma**: Cloudflare Pages + Workers
- **Base de Datos**: Cloudflare D1 (SQLite)
- **Estilos**: Tailwind CSS + Custom CSS
- **Iconos**: Font Awesome 6.4.0
- **Tipografía**: Google Fonts (Inter)
- **Build Tool**: Vite (v6.3.5)
- **CLI**: Wrangler (v4.51.0)
- **Gestor de Procesos**: PM2 (para sandbox)

---

## 📖 Guía de Usuario

### Para Visitantes

1. **Página de Inicio**: Descubre qué es "Más Allá del Miedo" y cómo puede ayudarte
2. **El Libro**: Lee sobre el contenido, capítulos y beneficios del libro
3. **Método**: Conoce las 5 etapas del método de transformación
4. **Recursos Gratuitos**: Descarga tests, guías y checklists sin costo
5. **Contacto**: Envía tus dudas o consultas directamente

### Para Administradores

**Consultar base de datos local:**
```bash
npm run db:console:local
# Ejecutar: SELECT * FROM contacts;
# Ejecutar: SELECT * FROM subscribers;
```

**Ver logs del servidor:**
```bash
pm2 logs webapp --nostream
```

---

## 💻 Comandos de Desarrollo

### Desarrollo Local
```bash
# Compilar el proyecto
npm run build

# Iniciar servidor de desarrollo (sandbox)
npm run dev:sandbox

# Con PM2 (recomendado para sandbox)
pm2 start ecosystem.config.cjs
pm2 logs webapp --nostream

# Probar URLs
curl http://localhost:3000
curl http://localhost:3000/login
curl http://localhost:3000/mi-aprendizaje
curl http://localhost:3000/comunidad
curl http://localhost:3000/sobre-nosotros
```

### Base de Datos
```bash
# Aplicar migraciones locales
npm run db:migrate:local

# Aplicar migraciones en producción
npm run db:migrate:prod

# Consola de base de datos local
npm run db:console:local

# Consola de base de datos producción
npm run db:console:prod
```

### Git
```bash
# Ver estado
npm run git:status

# Hacer commit
npm run git:commit "mensaje del commit"
```

### Despliegue a Producción
```bash
# Compilar para producción
npm run build

# Desplegar a Cloudflare Pages
npm run deploy:prod

# O manualmente
npx wrangler pages deploy dist --project-name mas-alla-del-miedo
```

### Limpieza y Testing
```bash
# Limpiar puerto 3000
npm run clean-port

# Probar conexión local
npm run test

# Probar producción
curl https://mas-alla-del-miedo.pages.dev
```

---

## 🚀 Estado del Despliegue

### ✅ Producción
- **Plataforma**: Cloudflare Pages
- **URL**: <https://mas-alla-del-miedo.pages.dev>
- **Base de Datos**: D1 (ID: 4e3ef353-1198-4cd5-b415-a70e817b0b22)
- **Status**: ✅ **DESPLEGADO Y ACTIVO**
- **Branch**: main
- **Última Actualización**: 2024-12-29

### 🔧 Desarrollo
- **Entorno**: Sandbox
- **URL**: <https://3000-i5ufb1dp5fddctw1qd1fo-82b888ba.sandbox.novita.ai>
- **Status**: ✅ Activo

---

## 📝 Próximos Pasos Recomendados

### Corto Plazo
1. Crear páginas pendientes (Cursos, Comunidad, Blog)
2. Añadir contenido real a los recursos descargables
3. Implementar sistema de búsqueda en el blog
4. Optimizar imágenes y crear assets gráficos
5. Configurar analytics y tracking

### Mediano Plazo
1. Sistema de autenticación con Cloudflare Access
2. Integración de pagos (Stripe o PayPal)
3. Sistema de gestión de cursos online
4. Comunidad privada (Discord/Telegram)
5. Newsletter automatizado

### Largo Plazo
1. Aplicación móvil complementaria
2. Sistema de gamificación y progreso
3. Inteligencia artificial para recomendaciones personalizadas
4. Expansión internacional (traducción a otros idiomas)

---

## 🎨 Diseño y Estilo

### Paleta de Colores
- **Primario**: #8b5cf6 (Púrpura vibrante - representa transformación)
- **Secundario**: #ec4899 (Rosa intenso - representa valentía)
- **Oscuro**: #1e293b (Azul oscuro - representa profundidad)
- **Claro**: #f8fafc (Gris muy claro - representa claridad)
- **Acento**: #f59e0b (Naranja - representa luz/esperanza)

### Filosofía de Diseño
- **Cálido y protector**: Colores que transmiten seguridad
- **Juvenil sin ser infantil**: Diseño moderno y profesional
- **Minimalista**: Enfoque en contenido, sin distracciones
- **Accesible**: Alto contraste y tipografía legible

---

## 📚 Contenido del Libro (Base)

El libro "Más Allá del Miedo" por Ernesto Alvarez incluye:

- **18 capítulos** que cubren desde fundamentos hasta aplicaciones avanzadas
- **4 personajes principales**: Alex, María, Sam y Sarah
- **Marco H.E.R.O.**: Honra tu porqué, Embraca victorias, Reconfigura creencias, Own your movement
- **Laboratorio de Sombras**: Sección sobre psicología oscura ética
- **Ejercicios prácticos** al final de cada capítulo

---

## 🤝 Contribución y Soporte

Este proyecto está en desarrollo activo. Para dudas o sugerencias:

- **Email**: <soporte@masalladelmiedo.com> (pendiente configurar)
- **Repositorio**: (pendiente configurar GitHub)

---

## ⚠️ Disclaimer Legal

Este sitio web proporciona contenido educativo sobre psicología emocional y desarrollo personal. **No sustituye terapia profesional**. Si necesitas ayuda urgente, contacta a un profesional de salud mental certificado.

---

## 📄 Licencia

© 2024 Más Allá del Miedo. Todos los derechos reservados.

---

**Desarrollado con ❤️ para jóvenes valientes que quieren liderar su propia vida**
servados.

---

**Desarrollado con ❤️ para jóvenes valientes que quieren liderar su propia vida**
