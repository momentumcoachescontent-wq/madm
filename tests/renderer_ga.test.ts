import { describe, it, expect, vi } from 'vitest'
import app from '../src/index'

// Mocking bindings if necessary, but app.request allows passing env directly.

describe('Google Analytics Renderer', () => {
  it('should inject GA script when GA_MEASUREMENT_ID is present', async () => {
    // We need to mock D1 and R2 bindings as well because the app initialization or middleware might use them?
    // src/index.tsx uses csrf middleware and routes.
    // The renderer runs for '/' which is a public route.
    // Let's see if '/' requires DB. Usually "Inicio" page might just be static or minimal.
    // If it fails due to missing bindings, I'll mock them.

    const env = {
      GA_MEASUREMENT_ID: 'G-TEST-123',
      // Providing dummy bindings to avoid crashes if other middlewares access them
      DB: {},
      IMAGES_BUCKET: {}
    } as any

    const res = await app.request('/', {}, env)
    const text = await res.text()

    expect(text).toContain('https://www.googletagmanager.com/gtag/js?id=G-TEST-123')
    expect(text).toContain("gtag('config', 'G-TEST-123')")
  })

  it('should NOT inject GA script when GA_MEASUREMENT_ID is missing', async () => {
    const env = {
       DB: {},
       IMAGES_BUCKET: {}
    } as any
    const res = await app.request('/', {}, env)
    const text = await res.text()

    expect(text).not.toContain('googletagmanager.com/gtag/js')
  })
})
