import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { storyApiRoutes } from '../src/features/stories/routes/api'

// Mocks
const mockDB = {
  prepare: vi.fn(),
  batch: vi.fn(),
}
const mockBucket = {
  put: vi.fn(),
  delete: vi.fn(),
}

// Helper to create bindings
const getBindings = () => ({
  DB: mockDB as any,
  IMAGES_BUCKET: mockBucket as any,
  STORE_CLIENT_IP: 'true',
  MAX_UPLOAD_BYTES: '3145728' // 3MB
})

describe('Story Submission API', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    // Default mock for DB to avoid "cannot read properties of undefined"
    // Valid for rate limit checks (first query)
    mockDB.prepare.mockReturnValue({
      bind: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(null), // Rate limit allowed
        run: vi.fn().mockResolvedValue({ meta: { changes: 1 } })
      })
    })
  })

  it('should reject invalid file type', async () => {
    const app = new Hono()
    app.route('/', storyApiRoutes)

    const formData = new FormData()
    formData.append('file', new File(['content'], 'test.txt', { type: 'text/plain' }))

    const res = await app.request('/submissions', {
      method: 'POST',
      body: formData,
    }, getBindings())

    expect(res.status).toBe(400)
    const json = await res.json() as any
    expect(json.error).toContain('Invalid file type')
  })

  it('should reject missing metadata', async () => {
    const app = new Hono()
    app.route('/', storyApiRoutes)

    const htmlContent = '<html><body>No metadata</body></html>'
    const formData = new FormData()
    formData.append('file', new File([htmlContent], 'story.html', { type: 'text/html' }))

    const res = await app.request('/submissions', {
      method: 'POST',
      body: formData,
    }, getBindings())

    expect(res.status).toBe(400)
    const json = await res.json() as any
    expect(json.error).toContain('Missing required metadata')
  })

  it('should accept valid submission', async () => {
    const app = new Hono()
    app.route('/', storyApiRoutes)

    const validHtml = `
      <html>
        <head>
          <meta name="madm:title" content="Test Story">
          <meta name="madm:author" content="Tester">
        </head>
        <body>
          <section data-madm="story">Once upon a time...</section>
        </body>
      </html>
    `
    const formData = new FormData()
    formData.append('file', new File([validHtml], 'story.html', { type: 'text/html' }))
    formData.append('alias', 'TestUser')

    const mockBind = vi.fn()
    mockDB.prepare.mockReturnValue({ bind: mockBind })

    mockBind.mockImplementation((...args) => {
      return {
        first: vi.fn().mockImplementation(async () => {
           // If checking rate limit (key starts with ip:)
           if (typeof args[0] === 'string' && args[0].startsWith('ip:')) return null
           // If checking hash (hash check)
           if (args.length === 1 && typeof args[0] === 'string' && args[0].length === 64) return null // No duplicate
           return null
        }),
        run: vi.fn().mockResolvedValue({
          meta: { changes: 1, last_row_id: 123 }, // Correct structure for D1Meta
        })
      }
    })

    const res = await app.request('/submissions', {
      method: 'POST',
      body: formData,
    }, getBindings())

    expect(res.status).toBe(201)
    const json = await res.json() as any
    expect(json.success).toBe(true)
    expect(json.submissionId).toBe(123)
    expect(mockBucket.put).toHaveBeenCalled()
  })

  it('should reject duplicate submission', async () => {
    const app = new Hono()
    app.route('/', storyApiRoutes)

    const validHtml = `
      <html><head><meta name="madm:title" content="T"><meta name="madm:author" content="A"></head>
      <body><section data-madm="story">...</section></body></html>
    `
    const formData = new FormData()
    formData.append('file', new File([validHtml], 'story.html', { type: 'text/html' }))

    const mockBind = vi.fn()
    mockDB.prepare.mockReturnValue({ bind: mockBind })

    mockBind.mockImplementation((...args) => {
      return {
        first: vi.fn().mockImplementation(async () => {
           // Rate limit -> null
           if (typeof args[0] === 'string' && args[0].startsWith('ip:')) return null
           // Hash check -> Return existing record
           return { id: 99, status: 'pending' }
        }),
        run: vi.fn().mockResolvedValue({ meta: { changes: 1, last_row_id: 999 } })
      }
    })

    const res = await app.request('/submissions', {
      method: 'POST',
      body: formData,
    }, getBindings())

    expect(res.status).toBe(409)
    const json = await res.json() as any
    expect(json.error).toContain('already been submitted')
  })
})
