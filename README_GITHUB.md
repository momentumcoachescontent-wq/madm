# 🌟 Más Allá del Miedo - Plataforma Educativa LMS

[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare&logoColor=white)](https://fb2b3a67.mas-alla-del-miedo.pages.dev)
[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-Production-success)](https://fb2b3a67.mas-alla-del-miedo.pages.dev)

Plataforma educativa completa (LMS) enfocada en desarrollo emocional, psicología y crecimiento personal para adolescentes y adultos jóvenes.

---

## 🚀 URLs de Producción

- **🌐 Sitio Principal**: <https://fb2b3a67.mas-alla-del-miedo.pages.dev>
- **📚 Cursos**: <https://fb2b3a67.mas-alla-del-miedo.pages.dev/cursos>
- **📝 Blog**: <https://fb2b3a67.mas-alla-del-miedo.pages.dev/blog>
- **🔐 Demo Login**: <https://fb2b3a67.mas-alla-del-miedo.pages.dev/login>
  - Usuario: `demo@masalladelmiedo.com`
  - Contraseña: `demo123`

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Stack Tecnológico](#️-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Desarrollo](#-desarrollo)
- [Despliegue](#-despliegue)
- [Base de Datos](#️-base-de-datos)
- [Documentación](#-documentación)

---

## ✨ Características

### **Sistema de Gestión de Aprendizaje (LMS)**
- ✅ **Autenticación completa** (registro, login, sesiones)
- ✅ **4 cursos educativos** con 20 lecciones
- ✅ **Dashboard de estudiante** con seguimiento de progreso
- ✅ **Reproductor de video** integrado (YouTube/Vimeo)
- ✅ **Notas personales** con auto-guardado (30s)
- ✅ **Sistema de progreso** por lección y curso
- ✅ **Navegación inteligente** entre lecciones

### **Sistema de Pagos**
- ✅ **Checkout integrado** con Stripe y PayPal
- ✅ **Webhooks asíncronos** para eventos de pago
- ✅ **Registro de transacciones** completo
- ✅ **Inscripciones automáticas** al completar pago

### **Blog Educativo**
- ✅ **10 artículos** sobre psicología emocional
- ✅ **Sistema de categorías** con hashtags
- ✅ **Paginación** y búsqueda
- ✅ **Enlaces a cursos** relacionados

### **Funcionalidades Adicionales**
- ✅ **Formularios de contacto** y suscripción
- ✅ **Páginas informativas** (libro, método, comunidad)
- ✅ **Diseño responsive** con Tailwind CSS
- ✅ **Optimizado para SEO** y accesibilidad

### **En Desarrollo** 🚧
- ⏳ Quizzes y evaluaciones (DB lista)
- ⏳ Certificados automáticos en PDF
- ⏳ Notificaciones por email
- ⏳ Dashboard de instructor
- ⏳ Integración con Discord

---

## 🛠️ Stack Tecnológico

### **Backend**
- **Framework**: [Hono](https://hono.dev/) v4.10.7 (ultrarrápido, edge-first)
- **Runtime**: Cloudflare Workers (edge computing)
- **Base de Datos**: Cloudflare D1 (SQLite distribuido)
- **Autenticación**: bcrypt + session cookies
- **Pagos**: Stripe API + PayPal SDK

### **Frontend**
- **Estilos**: Tailwind CSS v3 (via CDN)
- **Iconos**: Font Awesome 6.4.0
- **Tipografía**: Google Fonts (Inter)
- **JavaScript**: Vanilla JS + Fetch API

### **DevOps & Tools**
- **Build Tool**: Vite v6.4.1
- **CLI**: Wrangler v4.51.0
- **Package Manager**: npm
- **Version Control**: Git + GitHub
- **CI/CD**: Cloudflare Pages (auto-deploy)
- **Process Manager**: PM2 (desarrollo local)

---

## 📁 Estructura del Proyecto

```
webapp/
├── src/
│   ├── index.tsx              # Aplicación principal Hono
│   └── auth-utils.ts          # Utilidades de autenticación
├── migrations/                # Migraciones de base de datos
│   ├── 0001_initial_schema.sql
│   ├── 0002_blog_posts.sql
│   ├── 0003_courses.sql
│   ├── 0004_learning_platform.sql
│   └── 0005_quizzes.sql
├── public/                    # Assets estáticos
│   └── static/               # CSS, JS, imágenes
├── dist/                      # Build de producción
├── seed_all_courses.sql       # Datos de cursos
├── seed_lessons.sql           # Datos de lecciones
├── seed_blog_posts.sql        # Datos de blog
├── ecosystem.config.cjs       # Configuración PM2
├── wrangler.jsonc             # Configuración Cloudflare
├── vite.config.ts             # Configuración Vite
├── package.json               # Dependencias y scripts
├── tsconfig.json              # Configuración TypeScript
├── README.md                  # Este archivo
├── EVALUACION_COMPLETA.md     # Evaluación del sitio
└── LECCIONES.md               # Documentación de lecciones
```

---

## 🚀 Instalación

### **Prerrequisitos**
- Node.js 18+ y npm
- Cuenta de Cloudflare (para despliegue)
- Git

### **Clonar el Repositorio**
```bash
git clone https://github.com/momentumcoachescontent-wq/masalladelmiedo.git
cd masalladelmiedo
```

### **Instalar Dependencias**
```bash
npm install
```

### **Configurar Variables de Entorno**
Crear archivo `.dev.vars` en la raíz:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
```

---

## 💻 Desarrollo

### **Configurar Base de Datos Local**
```bash
# Aplicar migraciones
npm run db:migrate:local

# Poblar con datos de ejemplo
npx wrangler d1 execute mas-alla-del-miedo-db --local --file=seed_all_courses.sql
npx wrangler d1 execute mas-alla-del-miedo-db --local --file=seed_lessons.sql
npx wrangler d1 execute mas-alla-del-miedo-db --local --file=seed_blog_posts.sql
```

### **Iniciar Servidor de Desarrollo**
```bash
# Compilar proyecto
npm run build

# Iniciar con PM2 (recomendado)
pm2 start ecosystem.config.cjs

# Ver logs
pm2 logs webapp --nostream

# O iniciar directamente (no recomendado para desarrollo largo)
npm run dev:sandbox
```

### **Acceder al Sitio Local**
- **URL**: <http://localhost:3000>
- **Usuario Demo**: <demo@masalladelmiedo.com> / demo123

### **Comandos Útiles**
```bash
# Ver estado de git
npm run git:status

# Hacer commit
npm run git:commit "mensaje"

# Consola de base de datos local
npm run db:console:local

# Limpiar puerto 3000
npm run clean-port

# Probar conexión
npm run test
```

---

## 🚀 Despliegue

### **Despliegue a Cloudflare Pages**

#### **1. Preparar Base de Datos en Producción**
```bash
# Aplicar migraciones
npm run db:migrate:prod

# Aplicar datos de ejemplo
npx wrangler d1 execute mas-alla-del-miedo-db --remote --file=seed_all_courses.sql
npx wrangler d1 execute mas-alla-del-miedo-db --remote --file=seed_lessons.sql
npx wrangler d1 execute mas-alla-del-miedo-db --remote --file=seed_blog_posts.sql
```

#### **2. Configurar Secrets**
```bash
npx wrangler pages secret put STRIPE_SECRET_KEY --project-name mas-alla-del-miedo
npx wrangler pages secret put STRIPE_WEBHOOK_SECRET --project-name mas-alla-del-miedo
npx wrangler pages secret put PAYPAL_CLIENT_ID --project-name mas-alla-del-miedo
npx wrangler pages secret put PAYPAL_CLIENT_SECRET --project-name mas-alla-del-miedo
```

#### **3. Desplegar**
```bash
# Build y deploy
npm run deploy:prod

# O manualmente
npm run build
npx wrangler pages deploy dist --project-name mas-alla-del-miedo
```

---

## 🗄️ Base de Datos

### **Esquema**
La base de datos D1 incluye 24 tablas:

**Core**:
- `users` - Usuarios del sistema
- `user_sessions` - Sesiones activas
- `courses` - Cursos disponibles
- `lessons` - Lecciones por curso
- `paid_enrollments` - Inscripciones pagadas

**Progreso**:
- `student_progress` - Progreso por lección
- `lesson_resources` - Recursos descargables

**Pagos**:
- `payment_transactions` - Historial de pagos
- `payment_refunds` - Reembolsos

**Blog**:
- `blog_posts` - Artículos del blog

**Evaluaciones** (preparado para futuro):
- `quizzes` - Evaluaciones por curso
- `quiz_questions` - Preguntas de quiz
- `quiz_options` - Opciones de respuesta
- `quiz_attempts` - Intentos de estudiantes
- `quiz_answers` - Respuestas guardadas

**Certificados** (preparado para futuro):
- `certificates` - Certificados generados

**Sistema**:
- `contacts` - Formularios de contacto
- `subscribers` - Suscriptores a recursos

### **Consultas Útiles**
```sql
-- Ver cursos del usuario demo
SELECT c.title, pe.payment_status 
FROM courses c 
JOIN paid_enrollments pe ON c.id = pe.course_id 
JOIN users u ON pe.user_id = u.id 
WHERE u.email = 'demo@masalladelmiedo.com';

-- Ver progreso de un estudiante
SELECT l.title, sp.completed, sp.progress_percentage
FROM lessons l
LEFT JOIN student_progress sp ON l.id = sp.lesson_id AND sp.user_id = 1
WHERE l.course_id = 1
ORDER BY l.order_index;

-- Estadísticas generales
SELECT 
  (SELECT COUNT(*) FROM users) as usuarios,
  (SELECT COUNT(*) FROM courses) as cursos,
  (SELECT COUNT(*) FROM lessons) as lecciones,
  (SELECT COUNT(*) FROM blog_posts) as articulos;
```

---

## 📚 Documentación

### **Documentos Disponibles**
- 📖 `README.md` - Este archivo (guía general)
- 📊 `EVALUACION_COMPLETA.md` - Evaluación detallada del sitio
- 📚 `LECCIONES.md` - Sistema de gestión de lecciones
- 💳 `PAGOS.md` - Sistema de pagos (si existe)
- 🔔 `WEBHOOKS.md` - Webhooks de Stripe/PayPal (si existe)

### **Recursos Externos**
- [Documentación de Hono](https://hono.dev/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

---

## 🧪 Testing

### **Pruebas Manuales**
```bash
# Verificar homepage
curl http://localhost:3000

# Probar API de autenticación
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=demo@masalladelmiedo.com&password=demo123"

# Verificar cursos
curl http://localhost:3000/cursos

# Verificar blog
curl http://localhost:3000/blog
```

---

## 🤝 Contribución

Este es un proyecto privado. Para cambios:

1. Crear una rama: `git checkout -b feature/nueva-funcionalidad`
2. Hacer commits: `git commit -m "Agregar nueva funcionalidad"`
3. Push a la rama: `git push origin feature/nueva-funcionalidad`
4. Crear Pull Request en GitHub

---

## 📝 Convenciones de Código

### **Commits**
Seguimos [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `docs:` Cambios en documentación
- `style:` Cambios de formato (no afectan código)
- `refactor:` Refactorización de código
- `test:` Agregar o modificar tests
- `chore:` Tareas de mantenimiento

### **Código TypeScript**
- Usar tipos explícitos cuando sea posible
- Nombres descriptivos para variables y funciones
- Comentarios para lógica compleja
- Máximo 100 caracteres por línea

---

## 🔒 Seguridad

### **Buenas Prácticas Implementadas**
- ✅ Contraseñas hasheadas con bcrypt (salt rounds: 10)
- ✅ Sesiones con HttpOnly cookies (SameSite=Lax)
- ✅ Validación de entrada en todos los formularios
- ✅ Protección CSRF con tokens de sesión
- ✅ Control de acceso basado en roles
- ✅ Secrets en Cloudflare (no en código)
- ✅ HTTPS obligatorio en producción

### **Reportar Vulnerabilidades**
Si encuentras una vulnerabilidad de seguridad, por favor **NO** abras un issue público. Contacta directamente al equipo.

---

## 📊 Métricas del Proyecto

### **Estadísticas de Código**
- **Líneas de código**: ~5,500+ (src/index.tsx)
- **Archivos**: 20+ archivos principales
- **Commits**: 15+ commits
- **Build size**: 384.53 kB (optimizado)

### **Funcionalidades**
- **Páginas**: 30+ rutas
- **APIs REST**: 20+ endpoints
- **Tablas DB**: 24 tablas
- **Migraciones**: 5 archivos SQL

---

## 🐛 Troubleshooting

### **Problema: Puerto 3000 en uso**
```bash
npm run clean-port
# O manualmente: fuser -k 3000/tcp
```

### **Problema: Base de datos local corrupta**
```bash
rm -rf .wrangler/state/v3/d1
npm run db:migrate:local
# Volver a aplicar seeds
```

### **Problema: Build falla**
```bash
rm -rf dist .wrangler node_modules
npm install
npm run build
```

### **Problema: Login no funciona**
Verificar que el password_hash del usuario demo es correcto:
```sql
SELECT email, password_hash FROM users WHERE email = 'demo@masalladelmiedo.com';
-- Debe ser: $2b$10$lDrSJBK.rNAn7o4lyJD1hOWzgtakuJEPlqi/zSdqjCykBgCeGrfYm
```

---

## 📜 Licencia

© 2024-2026 Más Allá del Miedo. Todos los derechos reservados.

Este es un proyecto propietario. El código no puede ser copiado, modificado o distribuido sin autorización explícita.

---

## 👥 Equipo

- **Autor Original**: Ernesto Alvarez
- **Desarrollo**: AI Assistant + Momentum Coaches
- **Infraestructura**: Cloudflare Pages

---

## 🙏 Agradecimientos

- [Cloudflare](https://cloudflare.com) por la infraestructura edge
- [Hono](https://hono.dev) por el framework ultrarrápido
- [Tailwind CSS](https://tailwindcss.com) por el sistema de diseño
- Comunidad open source por las herramientas increíbles

---

## 📧 Contacto

- **Website**: <https://fb2b3a67.mas-alla-del-miedo.pages.dev>
- **Email**: <soporte@masalladelmiedo.com> (pendiente configurar)
- **GitHub**: <https://github.com/momentumcoachescontent-wq/masalladelmiedo>

---

**🌟 Desarrollado con ❤️ para jóvenes valientes que quieren liderar su propia vida**

---

*Última actualización: 2026-01-09*
