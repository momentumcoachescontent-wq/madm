import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createBlogPost, NewBlogPost } from '../src/features/blog/models/blog'
import { VersioningService } from '../src/lib/versioning'
import { dbRun } from '../src/models/db'

// Mock dbRun for createBlogPost
vi.mock('../src/models/db', () => ({
  dbRun: vi.fn().mockResolvedValue({ last_row_id: 1 }),
  dbFirst: vi.fn(),
  dbAll: vi.fn(),
}))

describe('Blog Features', () => {
  describe('Sanitization in createBlogPost', () => {
    let mockDB: D1Database

    beforeEach(() => {
      vi.clearAllMocks()
      mockDB = {} as any
    })

    it('should sanitize content before inserting', async () => {
      const dirtyContent = '<script>alert("xss")</script><p>Hello</p>'
      const post: NewBlogPost = {
        title: 'Test',
        slug: 'test',
        content: dirtyContent
      }

      await createBlogPost(mockDB, post)

      // Expect content to be sanitized in the arguments passed to dbRun
      const args = vi.mocked(dbRun).mock.calls[0][2]
      const insertedContent = args[2] // 3rd argument is content

      expect(insertedContent).toBe('<p>Hello</p>')
      expect(insertedContent).not.toContain('<script>')
    })
  })

  describe('VersioningService Schema', () => {
    let mockDB: any

    beforeEach(() => {
      mockDB = {
        prepare: vi.fn().mockReturnThis(),
        bind: vi.fn().mockReturnThis(),
        run: vi.fn().mockResolvedValue({ meta: { last_row_id: 1 } }),
        first: vi.fn().mockResolvedValue(null),
        all: vi.fn().mockResolvedValue({ results: [] })
      }
    })

    it('should include new columns (slug, hashtags, scheduled_at) in insert query', async () => {
      const service = new VersioningService(mockDB as D1Database)
      const data = {
        title: 'Title',
        slug: 'slug-value',
        content: 'Content',
        hashtags: '#tag',
        scheduled_at: '2025-01-01'
      }

      await service.createVersion('blog_post', 1, data)

      const prepareCall = mockDB.prepare.mock.calls[0][0]
      // Verify SQL contains the new columns
      expect(prepareCall).toContain('slug')
      expect(prepareCall).toContain('hashtags')
      expect(prepareCall).toContain('scheduled_at')

      // Verify bind values include them
      // bind call args: entityId, status, userId, ...values
      const bindArgs = mockDB.bind.mock.calls[0]
      // We expect values to be passed.
      expect(bindArgs).toContain('slug-value')
      expect(bindArgs).toContain('#tag')
      expect(bindArgs).toContain('2025-01-01')
    })
  })
})
