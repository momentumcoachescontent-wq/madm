import { describe, it, expect, vi } from 'vitest'
import { Hono } from 'hono'
import { registerAdminRoutes } from '../src/routes/admin'

// Mock the admin app module to isolate the test and preserve expected responses
vi.mock('../src/admin', () => {
  const { Hono } = require('hono')
  const adminApp = new Hono()
  // Simulate middleware (no-op or simple pass-through)
  adminApp.use('*', async (c, next) => {
    await next()
  })
  adminApp.get('/', (c) => c.text('Admin Dashboard'))
  adminApp.get('/users', (c) => c.text('Users List'))

  return {
    default: adminApp
  }
})

describe('Full Admin Routes (Refactored)', () => {
  it('should match /admin/ and return dashboard', async () => {
    const app = new Hono()
    registerAdminRoutes(app as any)

    const res = await app.request('/admin/')
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Admin Dashboard')
  })

  it('should match /admin and redirect', async () => {
    const app = new Hono()
    registerAdminRoutes(app as any)

    const res = await app.request('/admin')
    expect(res.status).toBe(302)
    expect(res.headers.get('Location')).toBe('/admin/')
  })

  it('should match /admin/users', async () => {
    const app = new Hono()
    registerAdminRoutes(app as any)

    const res = await app.request('/admin/users')
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Users List')
  })
})
