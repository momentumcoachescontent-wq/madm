# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir a **Más Allá del Miedo**!

---

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo Contribuir?](#cómo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Flujo de Trabajo](#flujo-de-trabajo)
- [Convenciones de Código](#convenciones-de-código)
- [Convenciones de Commits](#convenciones-de-commits)
- [Pull Requests](#pull-requests)
- [Reportar Bugs](#reportar-bugs)

---

## 📜 Código de Conducta

Este proyecto sigue un código de conducta profesional. Al participar, te comprometes a:

- Ser respetuoso y profesional
- Aceptar críticas constructivas
- Enfocarte en lo mejor para el proyecto
- Mostrar empatía hacia otros contribuyentes

---

## 🚀 ¿Cómo Contribuir?

Puedes contribuir de varias formas:

1. **Reportar bugs** - Encuentra y reporta problemas
2. **Sugerir mejoras** - Propón nuevas funcionalidades
3. **Mejorar documentación** - Corrige o expande la documentación
4. **Escribir código** - Implementa nuevas funcionalidades o correcciones

---

## ⚙️ Configuración del Entorno

### Prerrequisitos
- Node.js 18+
- npm
- Git
- Cuenta de Cloudflare (para testing en producción)

### Setup Inicial
```bash
# 1. Fork del repositorio en GitHub
# 2. Clonar tu fork
git clone https://github.com/TU_USUARIO/masalladelmiedo.git
cd masalladelmiedo

# 3. Agregar upstream
git remote add upstream https://github.com/momentumcoachescontent-wq/masalladelmiedo.git

# 4. Instalar dependencias
npm install

# 5. Configurar variables de entorno
cp .dev.vars.example .dev.vars
# Editar .dev.vars con tus credenciales

# 6. Configurar base de datos local
npm run db:migrate:local
npx wrangler d1 execute mas-alla-del-miedo-db --local --file=seed_all_courses.sql
npx wrangler d1 execute mas-alla-del-miedo-db --local --file=seed_lessons.sql
npx wrangler d1 execute mas-alla-del-miedo-db --local --file=seed_blog_posts.sql

# 7. Build y ejecutar
npm run build
pm2 start ecosystem.config.cjs

# 8. Verificar
curl http://localhost:3000
```

---

## 🔄 Flujo de Trabajo

### 1. Crear una Rama
```bash
# Asegurarte de estar actualizado
git checkout main
git pull upstream main

# Crear rama feature
git checkout -b feature/nombre-descriptivo

# O para bug fixes
git checkout -b fix/descripcion-del-bug
```

### 2. Hacer Cambios
- Escribe código limpio y documentado
- Sigue las convenciones del proyecto
- Prueba tus cambios localmente
- Haz commits pequeños y frecuentes

### 3. Commit
```bash
git add .
git commit -m "tipo: descripción breve"
```

### 4. Push
```bash
git push origin feature/nombre-descriptivo
```

### 5. Pull Request
- Abre un PR en GitHub
- Describe claramente los cambios
- Referencia issues relacionados
- Espera revisión del código

---

## 💻 Convenciones de Código

### TypeScript
```typescript
// ✅ Bueno: Tipos explícitos
const getUserById = async (id: number): Promise<User | null> => {
  return await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first()
}

// ❌ Malo: Sin tipos
const getUserById = async (id) => {
  return await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first()
}
```

### Naming
```typescript
// Variables y funciones: camelCase
const userName = 'John'
function getUserData() {}

// Clases: PascalCase
class UserManager {}

// Constantes: UPPER_SNAKE_CASE
const MAX_RETRIES = 3

// Archivos: kebab-case
// auth-utils.ts, user-service.ts
```

### Formato
- Máximo 100 caracteres por línea
- Indentación: 2 espacios
- Punto y coma al final de statements
- Comillas simples para strings
- Trailing commas en arrays/objetos multilínea

### Comentarios
```typescript
// Comentarios breves en línea
const result = calculate() // Calcula el resultado

/**
 * Comentarios largos en bloque
 * con múltiples líneas explicando
 * lógica compleja
 */
function complexFunction() {
  // ...
}
```

---

## 📝 Convenciones de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

### Formato
```
tipo(scope): descripción breve

[cuerpo opcional]

[footer opcional]
```

### Tipos
- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **docs**: Cambios en documentación
- **style**: Formato (no afecta código)
- **refactor**: Refactorización
- **test**: Tests
- **chore**: Tareas de mantenimiento
- **perf**: Mejoras de rendimiento
- **ci**: Cambios en CI/CD

### Ejemplos
```bash
# Feature
git commit -m "feat(auth): agregar recuperación de contraseña"

# Bug fix
git commit -m "fix(dashboard): corregir cálculo de progreso"

# Documentación
git commit -m "docs: actualizar guía de instalación"

# Refactor
git commit -m "refactor(api): simplificar validación de entrada"

# Con cuerpo y footer
git commit -m "feat(cursos): agregar filtro por categoría

Implementa filtrado de cursos por categoría en la página principal.
Incluye actualización de la UI y tests.

Closes #123"
```

---

## 🔍 Pull Requests

### Antes de Abrir un PR

1. **Sincroniza con upstream**:
```bash
git fetch upstream
git rebase upstream/main
```

2. **Prueba todo localmente**:
```bash
npm run build
npm run test
```

3. **Verifica el código**:
```bash
# Revisar cambios
git diff main

# Verificar commits
git log main..HEAD --oneline
```

### Template de PR

Cuando abras un PR, usa este template:

```markdown
## 📋 Descripción

[Describe qué hace este PR y por qué es necesario]

## 🔗 Issues Relacionados

Closes #[número]

## ✅ Checklist

- [ ] Código probado localmente
- [ ] Tests agregados/actualizados
- [ ] Documentación actualizada
- [ ] Commits siguen convenciones
- [ ] Sin conflictos con main
- [ ] Build exitoso

## 📸 Screenshots

[Si aplica, agregar screenshots]

## 🧪 Cómo Probar

1. Checkout del branch
2. `npm install && npm run build`
3. `pm2 start ecosystem.config.cjs`
4. Abrir http://localhost:3000
5. [Pasos específicos de testing]
```

### Revisión de Código

Tu PR será revisado. Prepárate para:
- Responder preguntas sobre tu implementación
- Hacer cambios solicitados
- Iterar hasta la aprobación

---

## 🐛 Reportar Bugs

### Antes de Reportar

1. **Busca** si el bug ya fue reportado
2. **Verifica** que sea reproducible
3. **Prueba** en la última versión

### Template de Bug Report

```markdown
## 🐛 Descripción del Bug

[Descripción clara y concisa del problema]

## 📋 Pasos para Reproducir

1. Ir a '...'
2. Click en '...'
3. Scroll hasta '...'
4. Ver error

## ✅ Comportamiento Esperado

[Qué debería suceder]

## ❌ Comportamiento Actual

[Qué sucede realmente]

## 📸 Screenshots

[Si aplica]

## 🌐 Entorno

- OS: [ej. macOS 14.0]
- Browser: [ej. Chrome 120]
- Node: [ej. 18.17.0]
- npm: [ej. 9.6.7]

## 📝 Contexto Adicional

[Cualquier otra información relevante]

## 🔍 Posible Solución

[Si tienes idea de cómo arreglarlo]
```

---

## 💡 Sugerir Mejoras

### Template de Feature Request

```markdown
## 🚀 Descripción de la Funcionalidad

[Descripción clara de la funcionalidad propuesta]

## 🎯 Problema que Resuelve

[Explica qué problema resuelve esta funcionalidad]

## 💡 Solución Propuesta

[Describe cómo funcionaría]

## 🔄 Alternativas Consideradas

[Otras formas de resolver el problema]

## 📊 Impacto

- [ ] Usuarios finales
- [ ] Desarrolladores
- [ ] Rendimiento
- [ ] Base de datos
- [ ] Seguridad

## 🖼️ Mockups/Wireframes

[Si aplica]

## ✅ Checklist de Implementación

- [ ] Diseño de API
- [ ] Cambios en DB
- [ ] Actualización de UI
- [ ] Tests
- [ ] Documentación
```

---

## 📚 Recursos Útiles

- [Documentación de Hono](https://hono.dev/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🙋 ¿Preguntas?

Si tienes dudas sobre cómo contribuir:

1. Revisa la documentación existente
2. Busca en issues cerrados
3. Abre un issue con tu pregunta
4. Contacta al equipo

---

## 🎉 ¡Gracias por Contribuir!

Cada contribución, grande o pequeña, ayuda a hacer este proyecto mejor. ¡Apreciamos tu tiempo y esfuerzo!

---

**💜 Desarrollado con amor por la comunidad**
