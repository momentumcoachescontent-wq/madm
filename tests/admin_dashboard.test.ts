import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { CloudflareBindings } from '../src/types'
import adminApp from '../src/admin/index'

// Mocks
vi.mock('../src/middleware/admin', () => ({
  adminMiddleware: async (c: any, next: any) => await next()
}))

vi.mock('../src/models/blog', () => ({
  countBlogPosts: vi.fn().mockResolvedValue(5)
}))

vi.mock('../src/models/users', () => ({
  countUsers: vi.fn().mockResolvedValue(10)
}))

vi.mock('../src/models/courses', () => ({
  countCourses: vi.fn().mockResolvedValue(3)
}))

vi.mock('../src/models/lessons', () => ({
  countLessons: vi.fn().mockResolvedValue(20)
}))

vi.mock('../src/features/stories/models/stories', () => ({
  countStories: vi.fn((db, filters) => {
      if (filters && filters.status === 'pending') return Promise.resolve(2)
      return Promise.resolve(8) // Total
  })
}))

// Mock sub-apps
vi.mock('./blog', () => ({ default: new Hono() }))
vi.mock('./upload', () => ({ default: new Hono() }))
vi.mock('./media', () => ({ default: new Hono() }))
vi.mock('./users', () => ({ default: new Hono() }))
vi.mock('./courses', () => ({ default: new Hono() }))
vi.mock('./lessons', () => ({ default: new Hono() }))
vi.mock('../features/stories/routes/admin-stories', () => ({ default: new Hono() }))

describe('Admin Dashboard', () => {
  let app: Hono<{ Bindings: CloudflareBindings }>
  let mockDB: D1Database

  beforeEach(() => {
    mockDB = {} as unknown as D1Database
    app = adminApp
  })

  it('renders the dashboard with stories stats', async () => {
    const res = await app.request('/', {}, { DB: mockDB })
    expect(res.status).toBe(200)
    const text = await res.text()

    // Verify Title
    expect(text).toContain('Panel de Administración')

    // Verify Blog Stats
    expect(text).toContain('5 Posts')

    // Verify Users Stats
    expect(text).toContain('10 Usuarios')

    // Verify Stories Stats (The new feature)
    // We look for the specific text structure we added
    expect(text).toContain('Historias')
    expect(text).toContain('8 Total')
    expect(text).toContain('(2 pendientes)')

    // Verify Link
    expect(text).toContain('href="/admin/stories"')

    // Verify Color (Pink)
    expect(text).toContain('border-left: 5px solid #ec4899')
  })
})
