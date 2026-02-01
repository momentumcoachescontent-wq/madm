import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { registerStoriesRoutes } from '../src/features/stories/routes/stories'
import { createStory } from '../src/features/stories/models/stories'

// Mock the model functions
vi.mock('../src/features/stories/models/stories', () => ({
  updateStoryStatus: vi.fn(),
  createStory: vi.fn(),
  listStories: vi.fn().mockResolvedValue([]),
  countStories: vi.fn().mockResolvedValue(0),
  listPublicStories: vi.fn().mockResolvedValue([]),
  getPublicStoryBySlug: vi.fn(),
  incrementStoryView: vi.fn(),
  incrementStoryLike: vi.fn(),
}))

// Mock Auth
vi.mock('../src/auth-utils', () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ id: 1 }),
}))

describe('Stories Routes Validation', () => {
  let app: Hono<any>
  let mockDB: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockDB = {}
    app = new Hono()

    // Simple renderer mock
    app.use('*', async (c, next) => {
      c.setRenderer((content) => c.html(String(content)))
      await next()
    })

    registerStoriesRoutes(app)
  })

  describe('Text Submission', () => {
    it('accepts valid text submission', async () => {
      vi.mocked(createStory).mockResolvedValue({ meta: { changes: 1 } } as any)

      const form = new FormData()
      form.append('story_text', 'This is a valid story text.')

      const res = await app.request('/comparte-tu-historia', {
        method: 'POST',
        body: form
      }, {
        DB: mockDB,
        STORE_CLIENT_IP: 'true'
      })

      expect(res.status).toBe(200)
      expect(createStory).toHaveBeenCalledWith(mockDB, expect.objectContaining({
        story_text: 'This is a valid story text.',
        r2_key: 'text-submission',
        original_filename: 'text-submission.txt'
      }))
    })

    it('rejects empty story text', async () => {
      const form = new FormData()
      form.append('story_text', '   ')

      const res = await app.request('/comparte-tu-historia', {
        method: 'POST',
        body: form
      }, {
        DB: mockDB
      })

      expect(res.status).toBe(200) // Renders error view
      const text = await res.text()
      expect(text).toContain('Por favor, escribe tu historia')
      expect(createStory).not.toHaveBeenCalled()
    })

    it('rejects missing story text', async () => {
      const form = new FormData()
      // No story_text field

      const res = await app.request('/comparte-tu-historia', {
        method: 'POST',
        body: form
      }, {
        DB: mockDB
      })

      expect(res.status).toBe(200) // Renders error view
      const text = await res.text()
      expect(text).toContain('Por favor, escribe tu historia')
      expect(createStory).not.toHaveBeenCalled()
    })
  })
})
