
import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'

// Simulate Middleware
const adminMiddleware = async (c, next) => {
  // Simulate pass-through
  await next()
}

// Simulate adminApp
const adminApp = new Hono()
adminApp.use('*', adminMiddleware)
adminApp.get('/', (c) => c.text('Admin Dashboard'))
adminApp.get('/users', (c) => c.text('Users List'))

// Simulate registerAdminRoutes (Refactored version)
function registerAdminRoutes(app: Hono) {
  // Redirect /admin to /admin/ to ensure relative paths work
  app.get('/admin', (c) => c.redirect('/admin/'))

  // Mount the admin app
  app.route('/admin/', adminApp)
}

describe('Full Admin Routes (Refactored)', () => {
  it('should match /admin/ and return dashboard', async () => {
    const app = new Hono()
    registerAdminRoutes(app)

    const res = await app.request('/admin/')
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Admin Dashboard')
  })

  it('should match /admin and redirect', async () => {
    const app = new Hono()
    registerAdminRoutes(app)

    const res = await app.request('/admin')
    expect(res.status).toBe(302)
    expect(res.headers.get('Location')).toBe('/admin/')
  })

  it('should match /admin/users', async () => {
    const app = new Hono()
    registerAdminRoutes(app)

    const res = await app.request('/admin/users')
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Users List')
  })
})
