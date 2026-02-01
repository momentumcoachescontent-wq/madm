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

describe('Stories Submission Route', () => {
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

  it('POST /comparte-tu-historia - Returns error view if story_text is missing', async () => {
    const res = await app.request('/comparte-tu-historia', {
      method: 'POST',
      body: new FormData() // Empty body
    }, { DB: mockDB, STORE_CLIENT_IP: 'false' })

    const text = await res.text()
    expect(text).toContain('Por favor revisa tu envío')
  })

  it('POST /comparte-tu-historia - Returns error view if story_text is not a string (e.g. file)', async () => {
    const formData = new FormData()
    // Simulate a file upload
    const file = new File(['content'], 'story.txt', { type: 'text/plain' })
    formData.append('story_text', file)

    const res = await app.request('/comparte-tu-historia', {
      method: 'POST',
      body: formData
    }, { DB: mockDB, STORE_CLIENT_IP: 'false' })

    const text = await res.text()
    expect(text).toContain('Por favor revisa tu envío')
    // Should NOT throw 500
    expect(res.status).toBe(200)
  })

  it('POST /comparte-tu-historia - Succeeds with valid string', async () => {
    const formData = new FormData()
    formData.append('story_text', 'Valid story content')

    mockDB.run.mockResolvedValue({ meta: { changes: 1 } })

    const res = await app.request('/comparte-tu-historia', {
      method: 'POST',
      body: formData
    }, { DB: mockDB, STORE_CLIENT_IP: 'false' })

    const text = await res.text()
    expect(text).toContain('¡Historia Enviada!')
    expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO stories'))
  })
})
