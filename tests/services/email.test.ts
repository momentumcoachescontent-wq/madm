import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { sendResourceEmail } from '../../src/services/email'

describe('Email Service', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should send email successfully', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ id: '123' }),
    })

    const result = await sendResourceEmail(
      'test@example.com',
      'test-limites',
      'https://example.com/download.pdf',
      'api_key',
      'from@example.com'
    )

    expect(result).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith('https://api.resend.com/emails', expect.objectContaining({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer api_key'
      }
    }))

    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.to).toEqual(['test@example.com'])
    expect(body.from).toBe('from@example.com')
    expect(body.subject).toContain('Test de Límites')
    expect(body.html).toContain('https://example.com/download.pdf')
  })

  it('should handle API errors', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'Bad Request',
    })

    const result = await sendResourceEmail(
      'test@example.com',
      'test-limites',
      'https://example.com/download.pdf',
      'api_key',
      'from@example.com'
    )

    expect(result).toBe(false)
  })

  it('should handle fetch exceptions', async () => {
    fetchMock.mockRejectedValue(new Error('Network Error'))

    const result = await sendResourceEmail(
      'test@example.com',
      'test-limites',
      'https://example.com/download.pdf',
      'api_key',
      'from@example.com'
    )

    expect(result).toBe(false)
  })
})
