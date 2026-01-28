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
  getBlogPostBySlug: vi.fn(),
  incrementBlogPostViews: vi.fn(),
}))

vi.mock('../src/models/courses', () => ({
  listPublishedCourses: vi.fn(),
  countCourses: vi.fn(),
  getCourseBySlug: vi.fn(),
}))

vi.mock('../src/models/users', () => ({
    countUsers: vi.fn()
}))

vi.mock('../src/models/lessons', () => ({
    countLessons: vi.fn(),
    getFirstLesson: vi.fn(),
}))

vi.mock('../src/models/enrollments', () => ({
    getCertificateByCode: vi.fn()
}))

import * as AuthUtils from '../src/auth-utils'
import * as BlogModels from '../src/models/blog'
import * as CourseModels from '../src/models/courses'

describe('Sitemap Admin Leakage Verification', () => {
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

    // Register both to simulate full app environment
    registerAdminRoutes(app)
    registerPublicRoutes(app)
  })

  it('ensures no admin routes appear in sitemap.xml even when accessed by an admin', async () => {
    // 1. Simulate Admin User Logic
    // We simulate an admin user being logged in.
    vi.mocked(AuthUtils.getCurrentUser).mockResolvedValue({
      id: 1,
      name: 'Super Admin',
      email: 'admin@madm.com',
      role: 'admin'
    } as any)

    // 2. Mock Content
    vi.mocked(BlogModels.listBlogPosts).mockResolvedValue([
      { slug: 'safe-post', updated_at: '2023-01-01', created_at: '2023-01-01' }
    ] as any)
    vi.mocked(CourseModels.listPublishedCourses).mockResolvedValue([
      { slug: 'safe-course', updated_at: '2023-01-01', created_at: '2023-01-01' }
    ] as any)

    // 3. Request Sitemap
    const res = await app.request('/sitemap.xml', {}, { DB: mockDB })
    const text = await res.text()

    // 4. Verify Success
    expect(res.status).toBe(200)

    // 5. Verify Content matches expectations
    expect(text).toContain('/blog/safe-post')
    expect(text).toContain('/cursos/safe-course')

    // 6. CRITICAL CHECK: Verify no /admin routes leaked
    // We check for <loc> tags specifically to avoid false positives in text content (unlikely but possible)
    const locTags = text.match(/<loc>(.*?)<\/loc>/g) || []
    const adminLocs = locTags.filter(loc => loc.includes('/admin'))

    if (adminLocs.length > 0) {
        console.error('Leaked Admin Routes:', adminLocs)
    }

    expect(adminLocs.length).toBe(0)
    expect(text).not.toContain('/admin')
  })
})
