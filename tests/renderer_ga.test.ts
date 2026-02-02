import { describe, it, expect, vi } from 'vitest'
import app from '../src/index'

// Mocking bindings if necessary, but app.request allows passing env directly.

describe('Google Analytics Renderer', () => {
  it('should inject GA script when GA_MEASUREMENT_ID is present (GA4 format)', async () => {
    const env = {
      GA_MEASUREMENT_ID: 'G-TEST123',
      DB: {},
      IMAGES_BUCKET: {}
    } as any

    const res = await app.request('/', {}, env)
    const text = await res.text()

    expect(text).toContain('https://www.googletagmanager.com/gtag/js?id=G-TEST123')
    expect(text).toContain("gtag('config', 'G-TEST123')")
  })

  it('should inject GA script when GA_MEASUREMENT_ID is present (UA format)', async () => {
    const env = {
      GA_MEASUREMENT_ID: 'UA-12345-6',
      DB: {},
      IMAGES_BUCKET: {}
    } as any

    const res = await app.request('/', {}, env)
    const text = await res.text()

    expect(text).toContain('https://www.googletagmanager.com/gtag/js?id=UA-12345-6')
    expect(text).toContain("gtag('config', 'UA-12345-6')")
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

  it('should NOT inject GA script when GA_MEASUREMENT_ID is invalid (XSS attempt)', async () => {
    const env = {
      GA_MEASUREMENT_ID: '"><script>alert(1)</script>',
      DB: {},
      IMAGES_BUCKET: {}
    } as any

    const res = await app.request('/', {}, env)
    const text = await res.text()

    // Should not render the script
    expect(text).not.toContain('googletagmanager.com/gtag/js')
    // Should definitely not contain the injected script payload
    expect(text).not.toContain('<script>alert(1)</script>')
  })
})
