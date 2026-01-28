import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { registerPublicRoutes } from '../src/routes/public'
import { CloudflareBindings } from '../src/types'

// Mocks
vi.mock('../src/models/blog', () => ({
  listBlogPosts: vi.fn(),
  getBlogPostBySlug: vi.fn(),
  incrementBlogPostViews: vi.fn(),
  countBlogPosts: vi.fn(),
}))

vi.mock('../src/models/courses', () => ({
  listPublishedCourses: vi.fn(),
  getCourseBySlug: vi.fn(),
}))

vi.mock('../src/models/enrollments', () => ({
  getCertificateByCode: vi.fn(),
}))

vi.mock('../src/auth-utils', () => ({
  getCurrentUser: vi.fn(),
  userHasAccess: vi.fn(),
}))

// Import mocked modules
import * as BlogModels from '../src/models/blog'
import * as CourseModels from '../src/models/courses'

describe('Sitemap Fixes', () => {
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
    registerPublicRoutes(app)
  })

  it('GET /sitemap.xml - should handle null dates gracefully', async () => {
    vi.mocked(BlogModels.listBlogPosts).mockResolvedValue([
      { slug: 'post-1', updated_at: null, created_at: null },
      { slug: 'post-2', updated_at: undefined, created_at: undefined }
    ] as any)

    vi.mocked(CourseModels.listPublishedCourses).mockResolvedValue([
        { slug: 'course-1', updated_at: null, created_at: null }
    ] as any)

    const res = await app.request('/sitemap.xml', {}, { DB: mockDB })

    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('/blog/post-1')
    expect(text).toContain('/blog/post-2')
    expect(text).toContain('/cursos/course-1')
    // Should contain valid dates (today's date) instead of NaN-NaN-NaN
    const today = new Date().toISOString().split('T')[0]
    expect(text).toContain(`<lastmod>${today}</lastmod>`)
    expect(text).not.toContain('NaN-NaN-NaN')
    expect(text).not.toContain('Invalid Date')
  })

  it('GET /sitemap.xml - should escape XML special characters in slugs', async () => {
    vi.mocked(BlogModels.listBlogPosts).mockResolvedValue([
      { slug: 'post-with-&-amp', updated_at: '2023-01-01', created_at: '2023-01-01' },
      { slug: 'post<tag>', updated_at: '2023-01-01', created_at: '2023-01-01' }
    ] as any)

    vi.mocked(CourseModels.listPublishedCourses).mockResolvedValue([])

    const res = await app.request('/sitemap.xml', {}, { DB: mockDB })

    expect(res.status).toBe(200)
    const text = await res.text()
    // The implementation replaces & with &amp; FIRST, so 'post-with-&-amp' becomes 'post-with-&amp;-amp'
    expect(text).toContain('/blog/post-with-&amp;-amp')
    expect(text).toContain('/blog/post&lt;tag&gt;')
    expect(text).not.toContain('/blog/post-with-&-amp')
    expect(text).not.toContain('/blog/post<tag>')
  })
})
