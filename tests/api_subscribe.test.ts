import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { registerApiRoutes } from '../src/routes/api'
import { CloudflareBindings } from '../src/types'

// Mocks
vi.mock('../src/services/email', () => ({
  sendResourceEmail: vi.fn(),
}))

import { sendResourceEmail } from '../src/services/email'

describe('API Subscription', () => {
  let app: Hono<{ Bindings: CloudflareBindings }>
  let mockDB: D1Database

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup Mock DB
    mockDB = {
      prepare: vi.fn().mockReturnThis(),
      bind: vi.fn().mockReturnThis(),
      first: vi.fn(),
      all: vi.fn(),
      run: vi.fn(),
      batch: vi.fn(),
      dump: vi.fn(),
      exec: vi.fn(),
    } as unknown as D1Database

    // Setup App
    app = new Hono<{ Bindings: CloudflareBindings }>()
    registerApiRoutes(app)
  })

  it('POST /api/subscribe - sends email on success', async () => {
    // Mock DB insert
    const mockRun = vi.fn().mockResolvedValue({ changes: 1 })
    mockDB.prepare = vi.fn().mockReturnValue({
      bind: vi.fn().mockReturnValue({
        run: mockRun
      })
    })

    vi.mocked(sendResourceEmail).mockResolvedValue(true)

    const params = new URLSearchParams()
    params.append('name', 'Test User')
    params.append('email', 'test@example.com')
    params.append('resource', 'test-limites')

    const res = await app.request('http://localhost:8787/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    }, {
      DB: mockDB,
      RESEND_API_KEY: 'test-key',
      FROM_EMAIL: 'from@test.com',
      BASE_URL: 'http://localhost:8787'
    })

    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
    expect(body.emailSent).toBe(true)
    expect(body.downloadUrl).toBe('/downloads/test-limites.pdf')

    // Verify Email Service called
    expect(sendResourceEmail).toHaveBeenCalledWith(
      'test@example.com',
      'test-limites',
      'http://localhost:8787/downloads/test-limites.pdf',
      'test-key',
      'from@test.com'
    )
  })

  it('POST /api/subscribe - handles missing env vars', async () => {
    // Mock DB insert
    const mockRun = vi.fn().mockResolvedValue({ changes: 1 })
    mockDB.prepare = vi.fn().mockReturnValue({
      bind: vi.fn().mockReturnValue({
        run: mockRun
      })
    })

    const params = new URLSearchParams()
    params.append('name', 'Test User')
    params.append('email', 'test@example.com')
    params.append('resource', 'test-limites')

    const res = await app.request('http://localhost:8787/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    }, {
      DB: mockDB,
      // Missing API Key
    })

    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
    expect(body.emailSent).toBe(false)
    expect(sendResourceEmail).not.toHaveBeenCalled()
  })
})
