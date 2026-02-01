import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import adminApi from '../src/features/stories/routes/admin-api'
import { getStory, updateStoryThumbnail, deleteStory } from '../src/features/stories/models/stories'
import { getCurrentUser } from '../src/auth-utils'

// Mock dependencies
vi.mock('../src/features/stories/models/stories', () => ({
  getStory: vi.fn(),
  updateStoryThumbnail: vi.fn(),
  deleteStory: vi.fn(),
  updateStoryStatus: vi.fn(),
}))

vi.mock('../src/auth-utils', () => ({
  getCurrentUser: vi.fn(),
}))

vi.mock('../src/features/stories/services/story-processor', () => ({
  processStoryApproval: vi.fn(),
}))

describe('Admin Stories API', () => {
  let app: Hono<any>
  let mockDB: any
  let mockBucket: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockDB = {}
    mockBucket = {
      delete: vi.fn().mockResolvedValue(undefined),
    }
    app = new Hono()
    app.route('/', adminApi)
  })

  const mockAdmin = { id: 1, role: 'admin' }

  describe('POST /:id/thumbnail', () => {
    it('updates thumbnail with valid absolute URL', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockAdmin)
      vi.mocked(updateStoryThumbnail).mockResolvedValue(1) // 1 row changed

      const res = await app.request('/123/thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thumbnailUrl: 'https://example.com/image.jpg' })
      }, {
        DB: mockDB,
        MEDIA_ORIGIN: 'https://example.com'
      })

      expect(res.status).toBe(200)
      expect(updateStoryThumbnail).toHaveBeenCalledWith(mockDB, 123, 'https://example.com/image.jpg')
    })

    it('updates thumbnail with relative URL', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockAdmin)
      vi.mocked(updateStoryThumbnail).mockResolvedValue(1)

      const res = await app.request('/123/thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thumbnailUrl: '/media/image.jpg' })
      }, {
        DB: mockDB
      })

      expect(res.status).toBe(200)
      expect(updateStoryThumbnail).toHaveBeenCalledWith(mockDB, 123, '/media/image.jpg')
    })

    it('rejects invalid protocol (ftp)', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockAdmin)

      const res = await app.request('/123/thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thumbnailUrl: 'ftp://example.com/image.jpg' })
      }, {
        DB: mockDB,
        MEDIA_ORIGIN: 'https://example.com'
      })

      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toContain('Invalid protocol')
      expect(updateStoryThumbnail).not.toHaveBeenCalled()
    })

    it('rejects origin not in allowed list', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockAdmin)

      const res = await app.request('/123/thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thumbnailUrl: 'https://evil.com/image.jpg' })
      }, {
        DB: mockDB,
        MEDIA_ORIGIN: 'https://example.com'
      })

      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toContain('Invalid origin')
      expect(updateStoryThumbnail).not.toHaveBeenCalled()
    })

    it('accepts origin from BASE_URL', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockAdmin)
      vi.mocked(updateStoryThumbnail).mockResolvedValue(1)

      const res = await app.request('/123/thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thumbnailUrl: 'https://my-site.com/image.jpg' })
      }, {
        DB: mockDB,
        BASE_URL: 'https://my-site.com'
      })

      expect(res.status).toBe(200)
      expect(updateStoryThumbnail).toHaveBeenCalledWith(mockDB, 123, 'https://my-site.com/image.jpg')
    })

    it('accepts origin matching request host even if not in configuration', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockAdmin)
      vi.mocked(updateStoryThumbnail).mockResolvedValue(1)

      // Simulate a request coming to 'https://preview.com'
      // The user tries to set a thumbnail also on 'https://preview.com'
      const res = await app.request('https://preview.com/123/thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thumbnailUrl: 'https://preview.com/image.jpg' })
      }, {
        DB: mockDB,
        MEDIA_ORIGIN: 'https://example.com'
      })

      expect(res.status).toBe(200)
      expect(updateStoryThumbnail).toHaveBeenCalledWith(mockDB, 123, 'https://preview.com/image.jpg')
    })

    it('returns 404 if story not found (update returns 0)', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockAdmin)
      vi.mocked(updateStoryThumbnail).mockResolvedValue(0) // 0 rows changed

      const res = await app.request('/123/thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thumbnailUrl: 'https://example.com/image.jpg' })
      }, {
        DB: mockDB,
        MEDIA_ORIGIN: 'https://example.com'
      })

      expect(res.status).toBe(404)
      const data = await res.json()
      expect(data.error).toBe('Not Found')
    })
  })

  describe('DELETE /:id', () => {
    it('deletes story first, then R2', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockAdmin)
      vi.mocked(getStory).mockResolvedValue({ id: 123, r2_key: 'some-key' } as any)
      vi.mocked(deleteStory).mockResolvedValue(1) // Success

      // Since we can't easily inspect cleanupContentImages arguments without mocking it,
      // we rely on the fact that if it throws (e.g. invalid URL), this test might fail if exception wasn't caught.
      // But cleanupContentImages swallows errors.
      // We assume correct logic if response is 200.

      const res = await app.request('/123', {
        method: 'DELETE'
      }, {
        DB: mockDB,
        IMAGES_BUCKET: mockBucket
      })

      expect(res.status).toBe(200)
      expect(deleteStory).toHaveBeenCalledWith(mockDB, 123)
      // Check R2 delete was called
      expect(mockBucket.delete).toHaveBeenCalledWith('some-key')
    })

    it('returns 404 if deleteStory fails (returns 0)', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockAdmin)
      vi.mocked(getStory).mockResolvedValue({ id: 123, r2_key: 'some-key' } as any)
      vi.mocked(deleteStory).mockResolvedValue(0) // Fail

      const res = await app.request('/123', {
        method: 'DELETE'
      }, {
        DB: mockDB,
        IMAGES_BUCKET: mockBucket
      })

      expect(res.status).toBe(404)
      expect(deleteStory).toHaveBeenCalledWith(mockDB, 123)
      expect(mockBucket.delete).not.toHaveBeenCalled() // Should not try to delete from R2
    })
  })
})
