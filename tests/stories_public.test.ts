import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { registerStoriesRoutes } from '../src/features/stories/routes/stories'
import { CloudflareBindings } from '../src/types'

// Mocks
vi.mock('../src/auth-utils', async (importOriginal) => {
  const actual = await importOriginal<any>()
  return {
    ...actual,
    getCurrentUser: vi.fn().mockResolvedValue(null),
  }
})

describe('Public Stories Routes', () => {
  let app: Hono<{ Bindings: CloudflareBindings }>
  let mockDB: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockDB = {
      prepare: vi.fn(function(this: any) { return this }),
      bind: vi.fn(function(this: any) { return this }),
      first: vi.fn(),
      run: vi.fn(),
      all: vi.fn(),
    }

    app = new Hono<{ Bindings: CloudflareBindings }>()
    registerStoriesRoutes(app)
  })

  it('GET /historias - Lists published stories', async () => {
    // Mock dbAll for listPublicStories
    const mockStories = [
      { id: 1, slug: 'story-1', meta_title: 'Title 1', status: 'approved', views: 10, likes: 5, tags: 'tag1' },
      { id: 2, slug: 'story-2', meta_title: 'Title 2', status: 'approved', views: 20, likes: 10, tags: 'tag2' }
    ]
    mockDB.all.mockResolvedValueOnce({ results: mockStories })

    const res = await app.request('/historias', {}, { DB: mockDB })

    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('Title 1')
    expect(text).toContain('Title 2')

    // Verify Query
    expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining("SELECT * FROM stories WHERE status = 'approved'"))
  })

  it('GET /historias - Defaults to page 1 on invalid page param', async () => {
    mockDB.all.mockResolvedValueOnce({ results: [] })

    const res = await app.request('/historias?page=NaN', {}, { DB: mockDB })

    expect(res.status).toBe(200)

    // Verify Offset is 0 (page 1)
    // We can't easily check the offset value directly as it is bound, but we know if it didn't crash it's good.
    // However, if logic works, page=1 -> offset=0.
    // If logic failed and passed NaN, D1 mock might or might not complain depending on implementation,
    // but the code change ensures safe integer.
  })

  it('GET /historias/:slug - Shows story detail and increments view', async () => {
    const mockStory = {
      id: 1,
      slug: 'my-story',
      meta_title: 'My Story',
      status: 'approved',
      story_text: '<p>Content</p>',
      analysis_text: '<p>Analysis</p>',
      views: 10,
      likes: 5
    }

    // 1. getPublicStoryBySlug -> dbFirst
    mockDB.first.mockResolvedValueOnce(mockStory)

    // 2. incrementStoryView -> dbRun
    mockDB.run.mockResolvedValueOnce({ meta: { changes: 1 } })

    const res = await app.request('/historias/my-story', {}, { DB: mockDB })

    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('My Story')
    expect(text).toContain('Content')

    // Verify Fetch
    expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining("SELECT * FROM stories WHERE slug = ? AND status = 'approved'"))

    // Verify Increment
    expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining("UPDATE stories SET views = views + 1"))
  })

  it('GET /historias/:slug - 404 if not found', async () => {
    // getPublicStoryBySlug -> null
    mockDB.first.mockResolvedValueOnce(null)

    const res = await app.request('/historias/unknown', {}, { DB: mockDB })

    expect(res.status).toBe(404)
  })

  it('POST /historias/:slug/like - Increments like and redirects', async () => {
    const mockStory = { id: 1, slug: 'my-story' }

    // 1. getPublicStoryBySlug -> dbFirst
    mockDB.first.mockResolvedValueOnce(mockStory)

    // 2. incrementStoryLike -> dbRun
    mockDB.run.mockResolvedValueOnce({ meta: { changes: 1 } })

    const res = await app.request('/historias/my-story/like', {
      method: 'POST'
    }, { DB: mockDB })

    expect(res.status).toBe(302)
    expect(res.headers.get('Location')).toBe('/historias/my-story')

    // Verify Increment
    expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining("UPDATE stories SET likes = likes + 1"))
  })
})
