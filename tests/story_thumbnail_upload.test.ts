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

vi.mock('../src/lib/image-processing', () => ({
  processImage: vi.fn().mockResolvedValue({
      data: new ArrayBuffer(10), // Fake data
      contentType: 'image/jpeg'
  })
}))

describe('Story Thumbnail Upload Endpoint', () => {
  let app: Hono<any>
  let mockDB: any
  let mockBucket: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockDB = {}
    mockBucket = {
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    }
    app = new Hono()
    app.route('/', adminApi)
  })

  const mockAdmin = { id: 1, role: 'admin' }

  it('uploads new thumbnail and updates DB', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockAdmin)
      vi.mocked(getStory).mockResolvedValue({ id: 123, thumbnail_url: null } as any)
      vi.mocked(updateStoryThumbnail).mockResolvedValue(1)

      const formData = new FormData()
      formData.append('file', new File(['test'], 'test.png', { type: 'image/png' }))
      formData.append('width', '800')

      const res = await app.request('/123/thumbnail-upload', {
          method: 'POST',
          body: formData
      }, {
          DB: mockDB,
          IMAGES_BUCKET: mockBucket
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.success).toBe(true)

      // Verify R2 Put (Deterministic Key)
      expect(mockBucket.put).toHaveBeenCalledWith(
          'stories/123/thumbnail.jpg',
          expect.any(ArrayBuffer),
          expect.objectContaining({ httpMetadata: { contentType: 'image/jpeg' } })
      )

      // Verify DB Update with Cache Busting
      expect(updateStoryThumbnail).toHaveBeenCalledWith(
          mockDB,
          123,
          expect.stringMatching(/^\/media\/stories\/123\/thumbnail\.jpg\?v=\d+$/)
      )
  })

  it('cleans up old thumbnail if key is different', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockAdmin)
      // Story has old random thumbnail
      vi.mocked(getStory).mockResolvedValue({
          id: 123,
          thumbnail_url: '/media/old-random-key.jpg'
      } as any)
      vi.mocked(updateStoryThumbnail).mockResolvedValue(1)

      const formData = new FormData()
      formData.append('file', new File(['test'], 'test.png', { type: 'image/png' }))

      const res = await app.request('/123/thumbnail-upload', {
          method: 'POST',
          body: formData
      }, {
          DB: mockDB,
          IMAGES_BUCKET: mockBucket
      })

      expect(res.status).toBe(200)

      // Verify Delete called for old key
      expect(mockBucket.delete).toHaveBeenCalledWith('old-random-key.jpg')

      // Verify Put for new key
      expect(mockBucket.put).toHaveBeenCalledWith('stories/123/thumbnail.jpg', expect.any(Object), expect.any(Object))
  })

  it('does NOT delete if key is same (just overwrite)', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockAdmin)
      // Story already has the deterministic key (maybe with old version param)
      vi.mocked(getStory).mockResolvedValue({
          id: 123,
          thumbnail_url: '/media/stories/123/thumbnail.jpg?v=11111'
      } as any)
      vi.mocked(updateStoryThumbnail).mockResolvedValue(1)

      const formData = new FormData()
      formData.append('file', new File(['test'], 'test.png', { type: 'image/png' }))

      const res = await app.request('/123/thumbnail-upload', {
          method: 'POST',
          body: formData
      }, {
          DB: mockDB,
          IMAGES_BUCKET: mockBucket
      })

      expect(res.status).toBe(200)

      // Verify Delete NOT called (optimization)
      expect(mockBucket.delete).not.toHaveBeenCalled()

      // Verify Put (Overwrite)
      expect(mockBucket.put).toHaveBeenCalledWith('stories/123/thumbnail.jpg', expect.any(Object), expect.any(Object))
  })
})
