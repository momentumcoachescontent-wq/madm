# 📂 Estructura del Proyecto - Más Allá del Miedo

Este documento describe la estructura completa del repositorio y el propósito de cada archivo y directorio.

---

## 🌳 Árbol de Directorios

```
masalladelmiedo/
├── .github/                          # Configuración de GitHub
│   ├── ISSUE_TEMPLATE/              # Templates para issues
│   │   ├── bug_report.md           # Template para reportar bugs
│   │   └── feature_request.md      # Template para solicitar funcionalidades
│   └── pull_request_template.md    # Template para Pull Requests
│
├── migrations/                       # Migraciones de base de datos D1
│   ├── 0001_initial_schema.sql     # Esquema inicial (users, sessions, contacts)
│   ├── 0002_blog_posts.sql         # Tabla de blog posts
│   ├── 0003_courses.sql            # Tablas de cursos y pagos
│   ├── 0004_learning_platform.sql  # Sistema de lecciones y progreso
│   └── 0005_quizzes.sql            # Sistema de quizzes y certificados
│
├── public/                          # Assets estáticos (servidos por Cloudflare)
│   └── static/                     # CSS, JS, imágenes
│       ├── styles.css              # Estilos personalizados
│       └── app.js                  # JavaScript del frontend
│
├── src/                            # Código fuente de la aplicación
│   ├── index.tsx                   # Aplicación principal Hono (5,500+ líneas)
│   └── auth-utils.ts               # Utilidades de autenticación (bcrypt, sessions)
│
├── dist/                           # Build de producción (generado por Vite)
│   ├── _worker.js                  # Worker compilado para Cloudflare
│   └── _routes.json                # Configuración de rutas
│
├── .wrangler/                      # Archivos temporales de Wrangler (ignorado en git)
│
├── node_modules/                   # Dependencias npm (ignorado en git)
│
├── .gitignore                      # Archivos ignorados por git
├── CONTRIBUTING.md                 # Guía de contribución para desarrolladores
├── EVALUACION_COMPLETA.md          # Evaluación detallada del sitio
├── LECCIONES.md                    # Documentación del sistema de lecciones
├── LICENSE                         # Licencia propietaria del proyecto
├── PAGOS.md                        # Documentación del sistema de pagos
├── README.md                       # Documentación principal del proyecto
├── README_GITHUB.md                # Documentación técnica para desarrolladores
├── STRUCTURE.md                    # Este archivo - Estructura del proyecto
├── WEBHOOKS.md                     # Documentación de webhooks (Stripe/PayPal)
│
├── ecosystem.config.cjs            # Configuración de PM2 para desarrollo
├── package.json                    # Dependencias y scripts npm
├── package-lock.json               # Lockfile de dependencias
├── tsconfig.json                   # Configuración de TypeScript
├── vite.config.ts                  # Configuración de Vite (build tool)
├── wrangler.jsonc                  # Configuración de Cloudflare Wrangler
│
├── seed_all_courses.sql            # Seed: 4 cursos + inscripciones del usuario demo
├── seed_blog_posts.sql             # Seed: 10 artículos educativos del blog
├── seed_lessons.sql                # Seed: 20 lecciones con contenido completo
└── seed_production.sql             # Instrucciones para aplicar seeds en producción
```

---

## 📁 Descripción de Directorios

### **`.github/`** - Configuración de GitHub
Contiene templates y configuraciones para mejorar el flujo de trabajo en GitHub.

- **`ISSUE_TEMPLATE/`**: Templates estructurados para crear issues
  - `bug_report.md`: Formato para reportar errores con toda la información necesaria
  - `feature_request.md`: Formato para solicitar nuevas funcionalidades
- **`pull_request_template.md`**: Template que se aplica automáticamente al crear PRs

### **`migrations/`** - Migraciones de Base de Datos
Archivos SQL que definen el esquema de la base de datos D1 (SQLite).

| Archivo | Descripción | Tablas Creadas |
|---------|-------------|----------------|
| `0001_initial_schema.sql` | Esquema inicial del sistema | `users`, `user_sessions`, `contacts`, `subscribers` |
| `0002_blog_posts.sql` | Sistema de blog | `blog_posts` |
| `0003_courses.sql` | Sistema de cursos y pagos | `courses`, `paid_enrollments`, `payment_transactions`, `payment_refunds` |
| `0004_learning_platform.sql` | Plataforma de aprendizaje | `lessons`, `lesson_resources`, `student_progress` |
| `0005_quizzes.sql` | Evaluaciones y certificados | `quizzes`, `quiz_questions`, `quiz_options`, `quiz_attempts`, `quiz_answers`, `certificates` |

**Comandos útiles**:
```bash
# Aplicar migraciones localmente
npm run db:migrate:local

# Aplicar migraciones en producción
npm run db:migrate:prod

# Listar estado de migraciones
npx wrangler d1 migrations list mas-alla-del-miedo-db --local
```

### **`public/`** - Assets Estáticos
Archivos servidos directamente por Cloudflare Pages (sin procesamiento).

- **`static/`**: Directorio para CSS, JavaScript e imágenes
  - Accesible en `/static/*` en producción
  - Ejemplo: `public/static/app.js` → `https://sitio.com/static/app.js`

**Nota**: Para Cloudflare Pages, todos los assets estáticos deben estar en `public/` al momento del build.

### **`src/`** - Código Fuente
El código TypeScript de la aplicación.

- **`index.tsx`** (5,500+ líneas): Aplicación principal Hono
  - Todas las rutas del sitio
  - APIs REST
  - Lógica de negocio
  - Renderizado de HTML

- **`auth-utils.ts`**: Utilidades de autenticación
  - Hash de contraseñas con bcrypt
  - Verificación de contraseñas
  - Creación y validación de sesiones
  - Obtención de usuario actual

### **`dist/`** - Build de Producción
Generado automáticamente por Vite al ejecutar `npm run build`.

- **`_worker.js`**: Worker de Cloudflare compilado (~384KB)
- **`_routes.json`**: Configuración de rutas para Cloudflare Pages
- **Archivos estáticos**: Copiados desde `public/`

**⚠️ No editar manualmente**: Este directorio se regenera en cada build.

---

## 📄 Descripción de Archivos de Configuración

### **Control de Versiones**

#### `.gitignore`
Define qué archivos no deben incluirse en el repositorio:
- `node_modules/` - Dependencias
- `.env`, `.dev.vars` - Variables de entorno sensibles
- `dist/`, `.wrangler/` - Archivos generados
- Logs, backups, archivos temporales

### **Documentación**

#### `README.md`
Documentación principal del proyecto orientada a usuarios y stakeholders:
- Resumen del proyecto
- URLs de producción
- Funcionalidades implementadas
- Estado del proyecto

#### `README_GITHUB.md`
Documentación técnica para desarrolladores:
- Stack tecnológico
- Instalación paso a paso
- Comandos de desarrollo
- Guía de despliegue
- Troubleshooting

#### `CONTRIBUTING.md`
Guía completa de contribución:
- Código de conducta
- Flujo de trabajo Git
- Convenciones de código
- Conventional Commits
- Templates de PR

#### `EVALUACION_COMPLETA.md`
Evaluación detallada del estado del sitio:
- Análisis de contenido
- Validación de funcionalidades
- Plan de despliegue
- Checklist de pruebas

#### `LECCIONES.md`
Documentación del sistema de lecciones:
- Arquitectura del sistema
- Base de datos
- APIs disponibles
- Flujo de usuario
- Testing

#### `PAGOS.md`
Documentación del sistema de pagos:
- Integración Stripe
- Integración PayPal
- Webhooks
- Testing

#### `WEBHOOKS.md`
Documentación de webhooks:
- Eventos de Stripe
- IPN de PayPal
- Seguridad y validación
- Logging

#### `STRUCTURE.md` (este archivo)
Descripción de la estructura del proyecto.

#### `LICENSE`
Licencia propietaria del proyecto (bilingüe ES/EN).

### **Configuración del Proyecto**

#### `package.json`
Define dependencias y scripts npm:

**Dependencias principales**:
- `hono`: Framework web
- `bcryptjs`: Hash de contraseñas

**DevDependencies**:
- `vite`: Build tool
- `wrangler`: CLI de Cloudflare
- `typescript`: Compilador TS
- `@cloudflare/workers-types`: Tipos para Workers

**Scripts útiles**:
```bash
npm run dev           # Desarrollo local con Vite
npm run dev:sandbox   # Desarrollo con Wrangler
npm run build         # Compilar para producción
npm run deploy        # Build + deploy a Cloudflare
npm run db:migrate:local  # Aplicar migraciones localmente
npm run db:console:local  # Consola de base de datos
npm run git:status    # Ver estado de git
npm run clean-port    # Limpiar puerto 3000
```

#### `tsconfig.json`
Configuración de TypeScript:
- Target: ES2021
- Module: ESNext
- Strict mode habilitado
- Tipos para Cloudflare Workers

#### `vite.config.ts`
Configuración de Vite (build tool):
- Plugin para Cloudflare Pages
- Output: `dist/`
- SSR bundle

#### `wrangler.jsonc`
Configuración de Cloudflare Wrangler:
- Nombre del proyecto: `mas-alla-del-miedo`
- Compatibilidad: 2025-11-26
- Binding a base de datos D1
- Output: `dist/`

**Nota**: Usamos `.jsonc` para permitir comentarios en el archivo.

#### `ecosystem.config.cjs`
Configuración de PM2 para desarrollo:
- Script: `npx wrangler pages dev dist`
- Puerto: 3000
- IP: 0.0.0.0 (accesible desde fuera)
- Watch: deshabilitado (usa hot-reload de Wrangler)

### **Seeds de Base de Datos**

#### `seed_all_courses.sql`
Datos de ejemplo de cursos:
- 4 cursos completos con descripciones
- Usuario demo: `demo@masalladelmiedo.com`
- 4 inscripciones pagadas del usuario demo

#### `seed_lessons.sql`
Datos de ejemplo de lecciones:
- 20 lecciones distribuidas en 4 cursos
- Contenido HTML completo
- Videos embedidos (YouTube)
- Metadatos (módulo, número, duración)

#### `seed_blog_posts.sql`
Artículos del blog:
- 10 artículos educativos sobre psicología emocional
- Contenido HTML formateado
- Imágenes destacadas (Unsplash)
- Hashtags y fechas

#### `seed_production.sql`
Instrucciones para aplicar seeds en producción de forma ordenada.

**Orden de aplicación**:
```bash
npx wrangler d1 execute mas-alla-del-miedo-db --remote --file=seed_all_courses.sql
npx wrangler d1 execute mas-alla-del-miedo-db --remote --file=seed_lessons.sql
npx wrangler d1 execute mas-alla-del-miedo-db --remote --file=seed_blog_posts.sql
```

---

## 🗂️ Archivos que NO están en Git

Estos archivos están en `.gitignore` y no se incluyen en el repositorio:

### **Dependencias y Build**
- `node_modules/` - Dependencias npm (~500MB)
- `dist/` - Build de producción (se genera con `npm run build`)
- `.wrangler/` - Cache y estado local de Wrangler

### **Variables de Entorno**
- `.env` - Variables de entorno generales
- `.dev.vars` - Variables para desarrollo local de Wrangler

**Ejemplo de `.dev.vars`**:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
```

### **Logs y Temporales**
- `*.log` - Logs de npm, PM2, etc.
- `.pm2/` - Datos de PM2
- `tmp/`, `temp/` - Archivos temporales

### **Backups**
- `*.backup`, `*.bak` - Copias de seguridad
- `*.tar.gz` - Archivos comprimidos

---

## 🔄 Flujo de Trabajo Típico

### **1. Desarrollo Local**
```bash
# Clonar repositorio
git clone https://github.com/momentumcoachescontent-wq/masalladelmiedo.git
cd masalladelmiedo

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .dev.vars.example .dev.vars
# Editar .dev.vars con tus credenciales

# Configurar base de datos
npm run db:migrate:local
npx wrangler d1 execute mas-alla-del-miedo-db --local --file=seed_all_courses.sql
npx wrangler d1 execute mas-alla-del-miedo-db --local --file=seed_lessons.sql
npx wrangler d1 execute mas-alla-del-miedo-db --local --file=seed_blog_posts.sql

# Build y ejecutar
npm run build
pm2 start ecosystem.config.cjs

# Acceder a http://localhost:3000
```

### **2. Hacer Cambios**
```bash
# Crear rama
git checkout -b feature/mi-funcionalidad

# Hacer cambios en src/index.tsx u otros archivos

# Rebuild
npm run build

# Reiniciar servidor
pm2 restart webapp

# Probar cambios
curl http://localhost:3000
```

### **3. Commit y Push**
```bash
# Ver cambios
git status
git diff

# Agregar archivos
git add src/index.tsx

# Commit siguiendo Conventional Commits
git commit -m "feat(cursos): agregar filtro por categoría"

# Push
git push origin feature/mi-funcionalidad

# Abrir Pull Request en GitHub
```

### **4. Despliegue a Producción**
```bash
# Asegurarse de estar en main y actualizado
git checkout main
git pull origin main

# Build
npm run build

# Desplegar a Cloudflare Pages
npx wrangler pages deploy dist --project-name mas-alla-del-miedo

# O usar el script
npm run deploy:prod
```

---

## 📊 Estadísticas del Proyecto

### **Código**
- **Líneas de código**: ~5,500+ (src/index.tsx)
- **Archivos de código**: 2 TypeScript
- **Archivos de config**: 8 principales
- **Documentación**: 8 archivos .md

### **Base de Datos**
- **Tablas**: 24 tablas operativas
- **Migraciones**: 5 archivos SQL
- **Seeds**: 4 archivos de datos de ejemplo

### **Build**
- **Tamaño del worker**: 384.53 KB
- **Tiempo de build**: ~2-3 segundos
- **Módulos transformados**: 261

### **Git**
- **Commits**: 15+ commits
- **Branch principal**: main
- **Remote**: GitHub

---

## 🔍 Navegación Rápida

### **Para Desarrolladores Nuevos**
1. Leer: `README_GITHUB.md` - Guía técnica completa
2. Leer: `CONTRIBUTING.md` - Cómo contribuir
3. Explorar: `src/index.tsx` - Código principal
4. Revisar: `migrations/` - Esquema de base de datos

### **Para Contribuyentes**
1. Leer: `CONTRIBUTING.md` - Flujo de trabajo
2. Revisar: `.github/ISSUE_TEMPLATE/` - Templates de issues
3. Revisar: `.github/pull_request_template.md` - Template de PR

### **Para Deployment**
1. Leer: `README_GITHUB.md` - Sección de despliegue
2. Revisar: `wrangler.jsonc` - Configuración
3. Ejecutar: Seeds de base de datos en orden

### **Para Troubleshooting**
1. Consultar: `README_GITHUB.md` - Sección de troubleshooting
2. Revisar: Logs de PM2 (`pm2 logs webapp --nostream`)
3. Verificar: Variables de entorno en `.dev.vars`

---

## 📚 Recursos Adicionales

### **Documentación Externa**
- [Hono Framework](https://hono.dev/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Vite](https://vitejs.dev/)

### **Guías Internas**
- Sistema de Lecciones: `LECCIONES.md`
- Sistema de Pagos: `PAGOS.md`
- Webhooks: `WEBHOOKS.md`
- Evaluación Completa: `EVALUACION_COMPLETA.md`

---

## 🔐 Seguridad

### **Archivos Sensibles**
Nunca incluir en Git:
- Claves de API (Stripe, PayPal)
- Contraseñas de base de datos
- Tokens de acceso
- Certificados SSL

### **Variables de Entorno**
Usar siempre:
- `.dev.vars` para desarrollo local
- Cloudflare Secrets para producción

```bash
# Configurar secrets en producción
npx wrangler pages secret put STRIPE_SECRET_KEY --project-name mas-alla-del-miedo
```

---

## 🤝 Contribuir

Para contribuir a este proyecto:

1. **Fork** el repositorio
2. **Clonar** tu fork
3. **Crear** una rama para tu funcionalidad
4. **Hacer** commits siguiendo convenciones
5. **Push** a tu fork
6. **Abrir** un Pull Request

Ver `CONTRIBUTING.md` para más detalles.

---

## 📄 Licencia

Este proyecto usa una licencia propietaria. Ver `LICENSE` para más información.

---

**Última actualización**: 2026-01-09  
**Mantenido por**: Momentum Coaches  
**Versión de este documento**: 1.0
