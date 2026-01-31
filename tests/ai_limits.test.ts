import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { registerAiRoutes } from '../src/routes/ai'
import { CloudflareBindings } from '../src/types'

// Mocks
vi.mock('../src/auth-utils', async (importOriginal) => {
  const actual = await importOriginal<any>()
  return {
    ...actual,
    getCurrentUser: vi.fn(),
  }
})

import * as AuthUtils from '../src/auth-utils'

describe('AI Assistant Limits', () => {
  let app: Hono<{ Bindings: CloudflareBindings }>
  let mockDB: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup Mock DB with chainable methods
    // prepare() returns the DB object (acting as the statement)
    // bind() returns the DB object
    // first() and run() are methods on that object
    mockDB = {
      prepare: vi.fn(function(this: any) { return this }),
      bind: vi.fn(function(this: any) { return this }),
      first: vi.fn(),
      run: vi.fn(),
    }

    // Setup App
    app = new Hono<{ Bindings: CloudflareBindings }>()
    registerAiRoutes(app)
  })

  it('Anonymous user: Limit 1 - Allowed', async () => {
    // 1. Mock Anonymous
    vi.mocked(AuthUtils.getCurrentUser).mockResolvedValue(null)

    // 2. DB Mocks
    // Usage Check: returns null (Not found -> Insert path)
    mockDB.first.mockResolvedValueOnce(null)
    // Insert: returns success
    mockDB.run.mockResolvedValueOnce({ meta: { changes: 1 } })

    const res = await app.request('/asistente-ia', {
      headers: { 'CF-Connecting-IP': '1.2.3.4' }
    }, { DB: mockDB })

    expect(res.status).toBe(302)
    expect(res.headers.get('Location')).toContain('opal.google')

    // Verify Manual Upsert Flow (SELECT -> INSERT)
    expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT id, count FROM daily_ai_usage'))
    expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO daily_ai_usage'))
    expect(mockDB.run).toHaveBeenCalled()
  })

  it('Anonymous user: Limit 1 - Blocked', async () => {
    // 1. Mock Anonymous
    vi.mocked(AuthUtils.getCurrentUser).mockResolvedValue(null)

    // 2. DB Mocks
    // Usage Check: returns existing record with max usage (Update path)
    mockDB.first.mockResolvedValueOnce({ id: 99, count: 1 })
    // Update (Atomic Check): returns failure (changes: 0)
    mockDB.run.mockResolvedValueOnce({ meta: { changes: 0 } })

    const res = await app.request('/asistente-ia', {
      headers: { 'CF-Connecting-IP': '1.2.3.4' }
    }, { DB: mockDB })

    expect(res.status).toBe(200) // Render Limit Page
    const text = await res.text()
    expect(text).toContain('Límite Diario Alcanzado')
    expect(text).toContain('Regístrate Gratis') // Specific for Anon

    // Verify SELECT -> UPDATE flow
    expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT id, count FROM daily_ai_usage'))
    expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining('UPDATE daily_ai_usage'))
    expect(mockDB.run).toHaveBeenCalled()
  })

  it('Free User: Limit 3 - Allowed', async () => {
    // 1. Mock Free User
    vi.mocked(AuthUtils.getCurrentUser).mockResolvedValue({ id: 10, email: 'free@test.com' } as any)

    // 2. DB Mocks
    // Paid Check: returns null (Not paid)
    mockDB.first.mockResolvedValueOnce(null)
    // Usage Check: returns existing record (Update path)
    mockDB.first.mockResolvedValueOnce({ id: 1, count: 1 })
    // Update: returns success
    mockDB.run.mockResolvedValueOnce({ meta: { changes: 1 } })

    const res = await app.request('/asistente-ia', {}, { DB: mockDB })

    expect(res.status).toBe(302)
    // Verify SELECT -> UPDATE flow
    expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT id, count FROM daily_ai_usage'))
    expect(mockDB.prepare).toHaveBeenCalledWith(expect.stringContaining('UPDATE daily_ai_usage'))
  })

  it('Free User: Limit 3 - Blocked', async () => {
    // 1. Mock Free User
    vi.mocked(AuthUtils.getCurrentUser).mockResolvedValue({ id: 10, email: 'free@test.com' } as any)

    // 2. DB Mocks
    // Paid Check: returns null (Not paid)
    mockDB.first.mockResolvedValueOnce(null)
    // Usage Check: returns existing record at limit
    mockDB.first.mockResolvedValueOnce({ id: 1, count: 3 })
    // Update: returns failure
    mockDB.run.mockResolvedValueOnce({ meta: { changes: 0 } })

    const res = await app.request('/asistente-ia', {}, { DB: mockDB })

    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('Acceso Premium') // CTA for Free users
  })

  it('Paid User: Limit 10 - Allowed', async () => {
    // 1. Mock Paid User
    vi.mocked(AuthUtils.getCurrentUser).mockResolvedValue({ id: 20, email: 'paid@test.com' } as any)

    // 2. DB Mocks
    // Paid Check: returns row (Paid)
    mockDB.first.mockResolvedValueOnce({ '1': 1 })
    // Usage Check: returns existing record (Update path)
    mockDB.first.mockResolvedValueOnce({ id: 2, count: 5 })
    // Update: returns success
    mockDB.run.mockResolvedValueOnce({ meta: { changes: 1 } })

    const res = await app.request('/asistente-ia', {}, { DB: mockDB })

    expect(res.status).toBe(302)
  })

  it('Paid User: Limit 10 - Blocked', async () => {
    // 1. Mock Paid User
    vi.mocked(AuthUtils.getCurrentUser).mockResolvedValue({ id: 20, email: 'paid@test.com' } as any)

    // 2. DB Mocks
    // Paid Check: returns row (Paid)
    mockDB.first.mockResolvedValueOnce({ '1': 1 })
    // Usage Check: returns existing record at limit
    mockDB.first.mockResolvedValueOnce({ id: 2, count: 10 })
    // Update: returns failure
    mockDB.run.mockResolvedValueOnce({ meta: { changes: 0 } })

    const res = await app.request('/asistente-ia', {}, { DB: mockDB })

    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('Eres un usuario Premium')
  })
})
