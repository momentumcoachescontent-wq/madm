# 🚀 Guía de Despliegue - Más Allá del Miedo

Esta guía proporciona instrucciones paso a paso para desplegar el proyecto en Cloudflare Pages.

---

## 📋 Prerequisitos

Antes de comenzar, asegúrate de tener:

- ✅ Node.js 18+ instalado
- ✅ npm instalado
- ✅ Cuenta de Cloudflare
- ✅ Wrangler CLI instalado globalmente: `npm install -g wrangler`
- ✅ Acceso al repositorio de GitHub
- ✅ API keys de Stripe y PayPal (para funcionalidad completa)

---

## 🔧 Configuración Inicial

### 1. Clonar el Repositorio

```bash
git clone https://github.com/momentumcoachescontent-wq/masalladelmiedo.git
cd masalladelmiedo
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno para Desarrollo

Crear archivo `.dev.vars`:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_WEBHOOK_ID=...
```

**⚠️ IMPORTANTE**: Nunca commitear este archivo a git (ya está en .gitignore).

---

## 🗄️ Configuración de Base de Datos

### 1. Crear Base de Datos D1

```bash
# Crear base de datos en Cloudflare
npx wrangler d1 create mas-alla-del-miedo-db

# Copiar el database_id que aparece en la salida
```

### 2. Actualizar wrangler.jsonc

Editar `wrangler.jsonc` y agregar el `database_id`:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "mas-alla-del-miedo",
  "compatibility_date": "2025-11-26",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "mas-alla-del-miedo-db",
      "database_id": "PEGAR-AQUI-EL-ID-DE-LA-BASE-DE-DATOS"
    }
  ]
}
```

### 3. Aplicar Migraciones

#### Desarrollo Local:
```bash
# Aplicar todas las migraciones
npm run db:migrate:local

# O manualmente:
npx wrangler d1 migrations apply mas-alla-del-miedo-db --local
```

#### Producción:
```bash
# Aplicar migraciones en producción
npm run db:migrate:prod

# O manualmente:
npx wrangler d1 migrations apply mas-alla-del-miedo-db --remote
```

### 4. Poblar Base de Datos con Datos de Ejemplo

#### Desarrollo Local:
```bash
# Aplicar seeds en orden
npx wrangler d1 execute mas-alla-del-miedo-db --local --file=seed_all_courses.sql
npx wrangler d1 execute mas-alla-del-miedo-db --local --file=seed_lessons.sql
npx wrangler d1 execute mas-alla-del-miedo-db --local --file=seed_blog_posts.sql
```

#### Producción:
```bash
# Aplicar seeds en producción
npx wrangler d1 execute mas-alla-del-miedo-db --remote --file=seed_all_courses.sql
npx wrangler d1 execute mas-alla-del-miedo-db --remote --file=seed_lessons.sql
npx wrangler d1 execute mas-alla-del-miedo-db --remote --file=seed_blog_posts.sql
```

### 5. Verificar Datos

```bash
# Verificar que los datos se crearon correctamente
npx wrangler d1 execute mas-alla-del-miedo-db --remote --command="
  SELECT 
    (SELECT COUNT(*) FROM courses) as cursos,
    (SELECT COUNT(*) FROM lessons) as lecciones,
    (SELECT COUNT(*) FROM blog_posts) as blog_posts,
    (SELECT email FROM users WHERE email = 'demo@masalladelmiedo.com') as usuario_demo
"
```

---

## 🏗️ Build del Proyecto

### Desarrollo Local

```bash
# Build
npm run build

# Iniciar con PM2
pm2 start ecosystem.config.cjs

# Verificar
curl http://localhost:3000

# Ver logs
pm2 logs webapp --nostream
```

### Build de Producción

```bash
# Limpiar builds anteriores
rm -rf dist .wrangler

# Build optimizado
npm run build

# Verificar tamaño
ls -lh dist/_worker.js
```

---

## 🌐 Despliegue a Cloudflare Pages

### Método 1: Despliegue Manual (Primera vez)

#### 1. Crear Proyecto en Cloudflare Pages

```bash
npx wrangler pages project create mas-alla-del-miedo \
  --production-branch main \
  --compatibility-date 2025-11-26
```

#### 2. Configurar Secrets

```bash
# Stripe
npx wrangler pages secret put STRIPE_SECRET_KEY --project-name mas-alla-del-miedo
npx wrangler pages secret put STRIPE_PUBLISHABLE_KEY --project-name mas-alla-del-miedo
npx wrangler pages secret put STRIPE_WEBHOOK_SECRET --project-name mas-alla-del-miedo

# PayPal
npx wrangler pages secret put PAYPAL_CLIENT_ID --project-name mas-alla-del-miedo
npx wrangler pages secret put PAYPAL_CLIENT_SECRET --project-name mas-alla-del-miedo
```

**Nota**: Wrangler te pedirá que ingreses cada valor de forma segura.

#### 3. Desplegar

```bash
# Build y deploy
npm run deploy:prod

# O manualmente:
npm run build
npx wrangler pages deploy dist --project-name mas-alla-del-miedo
```

#### 4. Verificar Despliegue

```bash
# La URL se mostrará en la consola, por ejemplo:
# https://abc123.mas-alla-del-miedo.pages.dev

# Probar endpoints
curl -I https://tu-deployment-url.pages.dev
curl -I https://tu-deployment-url.pages.dev/cursos
curl -I https://tu-deployment-url.pages.dev/blog
```

### Método 2: Despliegue Automático con GitHub

Una vez configurado el proyecto en Cloudflare Pages, puedes conectarlo a GitHub para despliegue automático:

#### 1. Conectar GitHub en Cloudflare Dashboard

1. Ir a <https://dash.cloudflare.com>
2. Pages → mas-alla-del-miedo → Settings → Builds & deployments
3. Click en "Connect to Git"
4. Autorizar GitHub
5. Seleccionar repositorio: `momentumcoachescontent-wq/masalladelmiedo`
6. Configurar:
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`

#### 2. Configurar Variables de Entorno en Cloudflare Dashboard

En Settings → Environment variables, agregar:

| Variable | Valor | Environment |
|----------|-------|-------------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | Production |
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Production |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Production |
| `PAYPAL_CLIENT_ID` | `...` | Production |
| `PAYPAL_CLIENT_SECRET` | `...` | Production |

**⚠️ IMPORTANTE**: Usa claves de **producción** (no test) para el entorno de production.

#### 3. Trigger Automático

Ahora cada push a `main` desplegará automáticamente:

```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main

# Cloudflare Pages desplegará automáticamente
# Ver progreso en: https://dash.cloudflare.com → Pages → mas-alla-del-miedo → Deployments
```

---

## 🔄 Flujo de Despliegue Completo

### Para Desarrollo

```bash
# 1. Crear rama
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios
# ... editar código ...

# 3. Probar localmente
npm run build
pm2 restart webapp
curl http://localhost:3000

# 4. Commit y push
git add .
git commit -m "feat: nueva funcionalidad"
git push origin feature/nueva-funcionalidad

# 5. Crear Pull Request en GitHub
```

### Para Producción

```bash
# 1. Mergear PR a main en GitHub

# 2. Pull de cambios
git checkout main
git pull origin main

# 3. Despliegue automático con Cloudflare Pages
# O manual:
npm run deploy:prod

# 4. Verificar
curl -I https://mas-alla-del-miedo.pages.dev
```

---

## 🔍 Verificación Post-Despliegue

### Checklist de Verificación

- [ ] Homepage carga correctamente
- [ ] Todas las páginas principales son accesibles
- [ ] Login funciona con usuario demo
- [ ] Dashboard muestra cursos inscritos
- [ ] Lecciones son accesibles
- [ ] Blog muestra artículos
- [ ] Formularios de contacto funcionan
- [ ] APIs responden correctamente

### Comandos de Verificación

```bash
# Homepage
curl -I https://mas-alla-del-miedo.pages.dev

# Páginas principales
curl -I https://mas-alla-del-miedo.pages.dev/cursos
curl -I https://mas-alla-del-miedo.pages.dev/blog
curl -I https://mas-alla-del-miedo.pages.dev/login

# API de autenticación
curl -I https://mas-alla-del-miedo.pages.dev/api/me

# Dashboard (debe redirigir si no autenticado)
curl -I https://mas-alla-del-miedo.pages.dev/mi-aprendizaje
```

---

## 🛠️ Troubleshooting

### Problema: Build Falla

```bash
# Limpiar todo y rebuild
rm -rf node_modules dist .wrangler
npm install
npm run build
```

### Problema: Base de Datos Vacía en Producción

```bash
# Verificar estado de migraciones
npx wrangler d1 migrations list mas-alla-del-miedo-db --remote

# Aplicar migraciones faltantes
npx wrangler d1 migrations apply mas-alla-del-miedo-db --remote

# Aplicar seeds
npx wrangler d1 execute mas-alla-del-miedo-db --remote --file=seed_all_courses.sql
```

### Problema: Variables de Entorno No Funcionan

```bash
# Verificar secrets configurados
npx wrangler pages secret list --project-name mas-alla-del-miedo

# Re-configurar un secret
npx wrangler pages secret put STRIPE_SECRET_KEY --project-name mas-alla-del-miedo
```

### Problema: 404 en Assets Estáticos

Verificar que:
1. Los archivos estén en `public/static/`
2. El build los copie a `dist/`
3. Las rutas en HTML usen `/static/` como prefijo

### Problema: Login No Funciona en Producción

1. Verificar que el usuario demo existe en la DB de producción
2. Verificar que el password_hash es correcto (bcrypt)
3. Verificar logs en Cloudflare Dashboard

---

## 📊 Monitoreo

### Ver Logs en Tiempo Real

```bash
# Ver logs de despliegue
npx wrangler pages deployment tail --project-name mas-alla-del-miedo

# Ver logs de requests
# Ir a Cloudflare Dashboard → Pages → mas-alla-del-miedo → Logs
```

### Métricas

En Cloudflare Dashboard:
- **Analytics** → Requests, bandwidth, errors
- **Speed** → Core Web Vitals
- **Logs** → Request logs y errores

---

## 🔐 Seguridad

### Checklist de Seguridad

- [ ] Secrets configurados (no en código)
- [ ] HTTPS habilitado (automático en Cloudflare)
- [ ] Contraseñas hasheadas con bcrypt
- [ ] Sesiones con HttpOnly cookies
- [ ] Validación de entrada en todas las APIs
- [ ] Webhooks verificados con signatures

### Actualizar Secrets

```bash
# Rotar una clave
npx wrangler pages secret put STRIPE_SECRET_KEY --project-name mas-alla-del-miedo

# Eliminar un secret (si es necesario)
npx wrangler pages secret delete OLD_SECRET --project-name mas-alla-del-miedo
```

---

## 🔄 Rollback

Si algo sale mal después de un despliegue:

### Opción 1: Rollback en Cloudflare Dashboard

1. Ir a Cloudflare Dashboard
2. Pages → mas-alla-del-miedo → Deployments
3. Buscar el último despliegue exitoso
4. Click en "..." → "Rollback to this deployment"

### Opción 2: Rollback con Git

```bash
# Revertir el último commit
git revert HEAD
git push origin main

# O revertir a un commit específico
git revert <commit-hash>
git push origin main

# Cloudflare desplegará automáticamente la versión anterior
```

---

## 📞 Soporte

Si encuentras problemas:

1. **Consultar documentación**:
   - `README_GITHUB.md` - Guía técnica
   - `STRUCTURE.md` - Estructura del proyecto
   - `TROUBLESHOOTING.md` - Solución de problemas comunes

2. **Verificar logs**:
   - Cloudflare Dashboard → Logs
   - `pm2 logs webapp` (desarrollo local)

3. **Buscar en issues**:
   - <https://github.com/momentumcoachescontent-wq/masalladelmiedo/issues>

4. **Crear issue**:
   - Usar template de bug report
   - Incluir logs y pasos de reproducción

---

## 📚 Referencias

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Hono Framework](https://hono.dev/)

---

**🎉 ¡Feliz Despliegue!**

---

**Última actualización**: 2026-01-09  
**Versión**: 1.0
