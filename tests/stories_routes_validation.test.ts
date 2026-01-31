import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { registerStoriesRoutes } from '../src/features/stories/routes/stories'
import adminStoriesApp from '../src/features/stories/routes/admin-stories'
import { updateStoryStatus, createStory } from '../src/features/stories/models/stories'

// Mock the model functions
vi.mock('../src/features/stories/models/stories', () => ({
  updateStoryStatus: vi.fn(),
  createStory: vi.fn(),
  listStories: vi.fn().mockResolvedValue([]),
  countStories: vi.fn().mockResolvedValue(0),
}))

// Mock Auth
vi.mock('../src/auth-utils', () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ id: 1 }),
}))

describe('Stories Routes Validation', () => {
  let app: Hono<any>
  let mockDB: any
  let mockR2: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockDB = {}
    mockR2 = {
      put: vi.fn(),
      delete: vi.fn(),
    }

    app = new Hono()

    // Simple renderer mock
    app.use('*', async (c, next) => {
      c.setRenderer((content) => c.html(String(content)))
      await next()
    })

    // Mount routes
    // Note: admin-stories is typically mounted at /admin/stories
    app.route('/admin/stories', adminStoriesApp)
    registerStoriesRoutes(app)
  })

  describe('Admin ID Validation', () => {
    it('rejects invalid ID format (alphanumeric mixed)', async () => {
      // Mock update to ensure it's not called if validation works (or checks logic before it)
      // But mainly we check the 400 response
      const res = await app.request('/admin/stories/123abc/status', {
        method: 'POST',
        body: new URLSearchParams({ status: 'approved' })
      }, { DB: mockDB })

      expect(res.status).toBe(400)
      const text = await res.text()
      // Current behavior might be different (parseInt parses "123" from "123abc"),
      // but we want to assert the *desired* behavior or fail if it's currently wrong/right.
      // The task is to Fix it. So valid test expects 400.
      // Current code: parseInt("123abc") -> 123 -> calls DB.
      // So this test should FAIL currently (it will return 200/302/404 depending on DB mock), verifying the bug.
    })

    it('rejects purely non-numeric ID', async () => {
      const res = await app.request('/admin/stories/abc/status', {
        method: 'POST',
        body: new URLSearchParams({ status: 'approved' })
      }, { DB: mockDB })

      expect(res.status).toBe(400)
    })

    it('accepts valid numeric ID', async () => {
      vi.mocked(updateStoryStatus).mockResolvedValue(1)
      const res = await app.request('/admin/stories/123/status', {
        method: 'POST',
        body: new URLSearchParams({ status: 'approved' })
      }, { DB: mockDB })

      // Should redirect or return success
      expect(res.status).toBe(302)
      expect(updateStoryStatus).toHaveBeenCalledWith(mockDB, 123, 'approved')
    })
  })

  describe('Upload Size Validation', () => {
    it('respects MAX_UPLOAD_BYTES limit', async () => {
      const form = new FormData()
      form.append('file', new File(['x'.repeat(200)], 'story.html', { type: 'text/html' }))

      // Limit 100 bytes, File 200 bytes -> Should Fail
      const res = await app.request('/comparte-tu-historia', {
        method: 'POST',
        body: form
      }, {
        DB: mockDB,
        IMAGES_BUCKET: mockR2,
        MAX_UPLOAD_BYTES: '100'
      })

      expect(res.status).toBe(413)
      expect(await res.text()).toBe('File too large')
    })

    it('falls back to default (3MB) if MAX_UPLOAD_BYTES is invalid', async () => {
      // Logic change required: default is currently 2MB in code, prompt asks for 3MB fallback check.
      // We will test that a 2.5MB file passes when env is garbage (limit defaults to 3MB)
      // 2.5MB = 2.5 * 1024 * 1024 = 2621440
      const size = 2621440
      // We don't need actual content of that size, just mock file.size if possible?
      // JS File object size is based on content. Creating large string might be slow/heavy?
      // 2.5MB string is fine.
      const largeContent = 'a'.repeat(size)
      const form = new FormData()
      // Valid metadata to pass that check
      const validHtml = `<meta name="madm:title" content="T"><meta name="madm:author" content="A"><section data-madm="story">${largeContent}</section>`
      form.append('file', new File([validHtml], 'story.html', { type: 'text/html' }))

      const res = await app.request('/comparte-tu-historia', {
        method: 'POST',
        body: form
      }, {
        DB: mockDB,
        IMAGES_BUCKET: mockR2,
        MAX_UPLOAD_BYTES: 'invalid'
      })

      // Should NOT be 413.
      // It might be 200 (Success) or 400 (Metadata) if my mock content is wrong.
      // I added metadata tags.
      expect(res.status).not.toBe(413)
      if (res.status === 200) {
        expect(createStory).toHaveBeenCalled()
      }
    })
  })

  describe('Metadata Flexible Validation', () => {
    it('accepts attributes in reverse order and mixed quotes', async () => {
      const html = `
        <html>
          <head>
            <!-- Reverse order, single quotes for attributes -->
            <meta content='My Title' name="madm:title">
            <meta content="My Author" name='madm:author'>
          </head>
          <body>
            <!-- Flexible section check -->
            <section class="foo" data-madm='story'>
               Story Content
            </section>
          </body>
        </html>
      `
      const form = new FormData()
      form.append('file', new File([html], 'story.html', { type: 'text/html' }))

      const res = await app.request('/comparte-tu-historia', {
        method: 'POST',
        body: form
      }, {
        DB: mockDB,
        IMAGES_BUCKET: mockR2
      })

      // Current code regex is strict, so this should FAIL (400) before fix.
      // After fix, it should PASS (200).
      if (res.status === 400) {
        const text = await res.text()
        console.log('Validation Failed as expected (before fix):', text)
      }

      // We assert 200 because we want to verify the FIX works.
      // Running this now will fail, which confirms the need for fix.
      expect(res.status).toBe(200)

      // Verify extraction correct
      expect(createStory).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        meta_title: 'My Title',
        meta_author: 'My Author'
      }))
    })

    it('rejects missing metadata', async () => {
      const html = `<html><body>No metadata</body></html>`
      const form = new FormData()
      form.append('file', new File([html], 'story.html', { type: 'text/html' }))

      const res = await app.request('/comparte-tu-historia', {
        method: 'POST',
        body: form
      }, {
        DB: mockDB,
        IMAGES_BUCKET: mockR2
      })

      expect(res.status).toBe(400)
      expect(await res.text()).toContain('Invalid file format')
    })
  })
})
