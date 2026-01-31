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

describe('AI Route Error Handling', () => {
  let app: Hono<{ Bindings: CloudflareBindings }>
  let mockDB: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockDB = {
      prepare: vi.fn().mockReturnThis(),
      bind: vi.fn().mockReturnThis(),
      first: vi.fn(),
      run: vi.fn(),
    }
    app = new Hono<{ Bindings: CloudflareBindings }>()
    registerAiRoutes(app)
  })

  it('returns descriptive error when "no such table" exception occurs', async () => {
    // Force DB run to throw the specific error
    mockDB.run.mockRejectedValue(new Error('no such table: daily_ai_usage'))

    const res = await app.request('/asistente-ia', {
      headers: { 'CF-Connecting-IP': '1.2.3.4' }
    }, { DB: mockDB })

    expect(res.status).toBe(500)
    const text = await res.text()
    expect(text).toContain('Error de configuración')
    expect(text).toContain('no such table')
  })

  it('returns generic error for other exceptions', async () => {
    // Force DB run to throw a generic error
    mockDB.run.mockRejectedValue(new Error('Some other DB error'))

    const res = await app.request('/asistente-ia', {
      headers: { 'CF-Connecting-IP': '1.2.3.4' }
    }, { DB: mockDB })

    expect(res.status).toBe(500)
    const text = await res.text()
    expect(text).toBe('Error interno del servidor')
  })
})
