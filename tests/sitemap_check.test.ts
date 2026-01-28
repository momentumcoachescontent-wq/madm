import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { registerPublicRoutes } from '../src/routes/public'
import { registerAdminRoutes } from '../src/routes/admin'
import { CloudflareBindings } from '../src/types'

// Mocks
vi.mock('../src/auth-utils', () => ({
  getCurrentUser: vi.fn(),
  userHasAccess: vi.fn(),
}))

vi.mock('../src/models/blog', () => ({
  listBlogPosts: vi.fn(),
  countBlogPosts: vi.fn(),
}))

vi.mock('../src/models/courses', () => ({
  listPublishedCourses: vi.fn(),
  countCourses: vi.fn(),
}))

vi.mock('../src/models/users', () => ({
    countUsers: vi.fn()
}))

vi.mock('../src/models/lessons', () => ({
    countLessons: vi.fn()
}))

// Import mocked modules
import * as AuthUtils from '../src/auth-utils'
import * as BlogModels from '../src/models/blog'
import * as CourseModels from '../src/models/courses'

describe('Sitemap and Admin Routes', () => {
  let app: Hono<{ Bindings: CloudflareBindings }>
  let mockDB: D1Database

  beforeEach(() => {
    vi.clearAllMocks()

    mockDB = {
        prepare: vi.fn().mockReturnThis(),
        bind: vi.fn().mockReturnThis(),
        first: vi.fn(),
        all: vi.fn(),
        run: vi.fn(),
    } as unknown as D1Database

    app = new Hono<{ Bindings: CloudflareBindings }>()
    // Register routes as in index.tsx
    registerAdminRoutes(app)
    registerPublicRoutes(app)
  })

  it('GET /sitemap.xml - should exist and return valid XML', async () => {
    // Setup mocks for dynamic content
    vi.mocked(BlogModels.listBlogPosts).mockResolvedValue([
      { slug: 'post-1', updated_at: '2023-01-01T00:00:00Z' },
      { slug: 'post-2', updated_at: '2023-01-02T00:00:00Z' }
    ] as any)

    vi.mocked(CourseModels.listPublishedCourses).mockResolvedValue([
        { slug: 'course-1', updated_at: '2023-01-01T00:00:00Z' }
    ] as any)

    const res = await app.request('/sitemap.xml', {}, { DB: mockDB })

    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('xml')
    const text = await res.text()
    expect(text).toContain('<urlset')
    expect(text).toContain('/blog/post-1')
    expect(text).toContain('/cursos/course-1')
    expect(text).not.toContain('/admin') // Should not list admin pages
  })

  it('GET /admin - should redirect to /admin/', async () => {
    const res = await app.request('/admin', {}, { DB: mockDB })
    expect(res.status).toBe(302)
    expect(res.headers.get('Location')).toBe('/admin/')
  })

  it('GET /admin/ - should be accessible for admin user', async () => {
    // Mock admin user
    vi.mocked(AuthUtils.getCurrentUser).mockResolvedValue({
      id: 1,
      name: 'Admin',
      email: 'admin@example.com',
      role: 'admin'
    } as any)

    const res = await app.request('/admin/', {}, { DB: mockDB })

    if (res.status === 404) {
        console.error('Admin page returned 404!')
    }

    // Should return 200 OK (Dashboard)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('Panel de Administración')
  })

  it('GET /admin/ - should redirect to login for non-admin', async () => {
     // Mock student user
     vi.mocked(AuthUtils.getCurrentUser).mockResolvedValue({
        id: 2,
        name: 'Student',
        email: 'student@example.com',
        role: 'student'
      } as any)

      const res = await app.request('/admin/', {}, { DB: mockDB })

      // Should redirect
      expect(res.status).toBe(302)
      expect(res.headers.get('Location')).toContain('/login')
  })

  it('GET /admin/blog-posts - should be accessible for admin', async () => {
    // Mock admin user
    vi.mocked(AuthUtils.getCurrentUser).mockResolvedValue({
      id: 1,
      name: 'Admin',
      email: 'admin@example.com',
      role: 'admin'
    } as any)

    // Mock count
    vi.mocked(BlogModels.countBlogPosts).mockResolvedValue(10)
    vi.mocked(BlogModels.listBlogPosts).mockResolvedValue([])

    const res = await app.request('/admin/blog-posts', {}, { DB: mockDB })

    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('Gestión de Blog') // Assuming this text exists in the list view
  })
})
