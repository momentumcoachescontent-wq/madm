import { Hono } from 'hono'
import adminApp from '../admin'
import { CloudflareBindings } from '../types'

export function registerAdminRoutes(app: Hono<{ Bindings: CloudflareBindings }>) {
  const adminRoutes = new Hono<{ Bindings: CloudflareBindings }>()

  // Redirect /admin to /admin/ to ensure relative paths work
  adminRoutes.get('/admin', (c) => c.redirect('/admin/'))

  // Mount the admin app
  adminRoutes.route('/admin/', adminApp)

  app.route('/', adminRoutes)
}
