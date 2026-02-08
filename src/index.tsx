import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { csrf } from 'hono/csrf'
import { renderer } from './renderer'
import { CloudflareBindings } from './types'
import { registerPublicRoutes } from './routes/public'
import { registerStudentRoutes } from './routes/student'
import { registerAdminRoutes } from './routes/admin'
import { registerApiRoutes } from './routes/api'
import { registerWebhookRoutes } from './routes/webhooks'
import { registerAiRoutes } from './routes/ai'
import { registerStoriesRoutes } from './features/stories/routes/stories'
import { registerMcpRoutes } from './routes/mcp'
import { registerUmbralRoutes } from './routes/umbral'

const csrfMiddleware = csrf()

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.use(
  '/api/*',
  cors({
    // IMPORTANT: If you use cookies/sessions via fetch, you need an explicit origin:
    origin: [
      'https://madm-7sb.pages.dev/',
      // add your custom domain too if you have one:
      // 'https://yourdomain.com'
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
)

app.use(renderer)

app.use(async (c, next) => {
  if (c.req.path.startsWith('/api/webhooks') || c.req.path.startsWith('/api/mcp')) {
    return next()
  }
  return csrfMiddleware(c, next)
})

registerWebhookRoutes(app)
registerApiRoutes(app)
registerAdminRoutes(app)
registerStudentRoutes(app)
registerAiRoutes(app)
registerStoriesRoutes(app)
registerStoriesRoutes(app)
registerMcpRoutes(app)
registerUmbralRoutes(app)
registerPublicRoutes(app)

export default app
