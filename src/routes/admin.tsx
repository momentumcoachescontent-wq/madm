import { Hono } from 'hono'
import adminApp from '../admin/index'
import { CloudflareBindings } from '../types'

export function registerAdminRoutes(app: Hono<{ Bindings: CloudflareBindings }>) {
  // Mount admin app at /admin (no trailing slash redirect)
  app.route('/admin', adminApp)
}
