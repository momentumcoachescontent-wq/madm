import { describe, it, expect, vi } from 'vitest'
import app from '../src/index'

// We need to mock the environment for the app execution
// But imports are already done.

describe('App Integration - CSRF', () => {
  it('protects routes with CSRF', async () => {
    // We can't easily mock middleware inside the imported app instance
    // But we can check if requests fail without Origin

    // Using a mock DB
    const mockDB = {
       prepare: vi.fn(() => ({ bind: vi.fn(() => ({ first: vi.fn(), run: vi.fn(), all: vi.fn() })) }))
    }

    const res = await app.request('/comparte-tu-historia', {
      method: 'POST',
      body: new FormData()
    }, { DB: mockDB, STORE_CLIENT_IP: 'false' })

    expect(res.status).toBe(403)
  })

  it('allows request with Origin', async () => {
      const mockDB = {
       prepare: vi.fn(() => ({ bind: vi.fn(() => ({ first: vi.fn(), run: vi.fn(), all: vi.fn() })) }))
    }

    const formData = new FormData()
    formData.append('story_text', 'valid')

    // We need to mock createStory to avoid DB errors
    // Since we imported the real app, it uses real models.
    // Real models use c.env.DB.
    // If we mock DB correctly, it should work.
    // But `createStory` might do complex SQL.
    // Ideally we mock the model, but we already imported the app which imported the routes which imported the models.
    // Changes to mocks after import might not work if they are top-level imports.
    // But vitest mocks are hoisted.

    // However, for this test I just want to see 403 vs non-403.
    // Even if the handler fails later (500), it means CSRF passed (200->500).

    const res = await app.request('/comparte-tu-historia', {
      method: 'POST',
      headers: { Origin: 'http://localhost' },
      body: formData
    }, { DB: mockDB, STORE_CLIENT_IP: 'false' })

    // If CSRF passes, it proceeds to handler.
    // Handler might fail due to DB mock, but status won't be 403.
    expect(res.status).not.toBe(403)
  })

  it('excludes webhooks from CSRF', async () => {
    const mockDB = {
       prepare: vi.fn(() => ({ bind: vi.fn(() => ({ first: vi.fn(), run: vi.fn(), all: vi.fn() })) }))
    }

    // Webhooks usually don't have Origin
    const res = await app.request('/api/webhooks/stripe', {
      method: 'POST',
      // No Origin
    }, { DB: mockDB })

    // It should NOT be 403.
    // It might be 400 (missing signature) or 200, but not 403.
    expect(res.status).not.toBe(403)
  })
})
