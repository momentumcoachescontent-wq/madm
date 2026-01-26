import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'
import { CloudflareBindings } from './types'

// Import route registration functions
import { registerPublicRoutes } from './routes/public'
import { registerStudentRoutes } from './routes/student'
import { registerAdminRoutes } from './routes/admin'
import { registerApiRoutes } from './routes/api'
import { registerWebhookRoutes } from './routes/webhooks'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// Habilitar CORS para APIs
app.use('/api/*', cors())

// Aplicar el renderer a todas las páginas
// Note: This middleware adds c.render capability. It doesn't force HTML on JSON responses.
app.use(renderer)

// Register Routes
// Order matters: More specific routes first if there are overlaps.

// Webhooks (under /api/webhooks)
registerWebhookRoutes(app)

// API (under /api)
registerApiRoutes(app)

// Admin (under /admin, handled by module)
registerAdminRoutes(app)

// Student (mostly /mi-aprendizaje, /cursos/:slug/..., etc)
registerStudentRoutes(app)

// Public (root /, /blog, etc)
registerPublicRoutes(app)

export default app
export type { CloudflareBindings } // Re-export for compatibility
