import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'
import { CloudflareBindings } from './types'

// Import route modules
import publicRoutes from './routes/public'
import studentRoutes from './routes/student'
import adminRoutes from './routes/admin'
import apiRoutes from './routes/api'
import webhookRoutes from './routes/webhooks'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// Habilitar CORS para APIs
app.use('/api/*', cors())

// Aplicar el renderer a todas las páginas
// Note: This middleware adds c.render capability. It doesn't force HTML on JSON responses.
app.use(renderer)

// Mount Routes
// Order matters: More specific routes first if there are overlaps,
// but here they are mostly distinct prefixes or handled within modules.

// Webhooks (under /api/webhooks)
app.route('/api/webhooks', webhookRoutes)

// API (under /api)
app.route('/api', apiRoutes)

// Admin (under /admin, handled by module)
app.route('/', adminRoutes)

// Student (mostly /mi-aprendizaje, /cursos/:slug/..., etc)
app.route('/', studentRoutes)

// Public (root /, /blog, etc)
app.route('/', publicRoutes)

export default app
export type { CloudflareBindings } // Re-export for compatibility if anything else imports it from here (though we moved it to types.ts)
