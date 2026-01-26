import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'
import { CloudflareBindings } from './types'
import { registerPublicRoutes } from './routes/public'
import { registerStudentRoutes } from './routes/student'
import { registerAdminRoutes } from './routes/admin'
import { registerApiRoutes } from './routes/api'
import { registerWebhookRoutes } from './routes/webhooks'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.use('/api/*', cors())
app.use(renderer)

registerWebhookRoutes(app)
registerApiRoutes(app)
registerAdminRoutes(app)
registerStudentRoutes(app)
registerPublicRoutes(app)

export default app
