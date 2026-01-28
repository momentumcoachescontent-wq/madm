import { Hono } from 'hono'
import adminApp from '../admin'
import { CloudflareBindings } from '../types'

export function registerAdminRoutes(app: Hono<{ Bindings: CloudflareBindings }>) {
  // Redirect /admin to /admin/ to ensure relative paths work
  app.get('/admin', (c) => c.redirect('/admin/'))

  // Mount the admin app
  app.route('/admin/', adminApp)
}
