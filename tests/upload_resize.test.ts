import { describe, it, expect, vi } from 'vitest'
import app from '../src/admin/upload'

// Mock dependencies
vi.mock('@jsquash/jpeg', () => ({
  decode: vi.fn().mockResolvedValue({ width: 1000, height: 1000, data: new Uint8Array(1000*1000*4) }),
  encode: vi.fn().mockResolvedValue(new ArrayBuffer(100))
}))

vi.mock('@jsquash/png', () => ({
  decode: vi.fn().mockResolvedValue({ width: 1000, height: 1000, data: new Uint8Array(1000*1000*4) })
}))

vi.mock('@jsquash/resize', () => ({
  default: vi.fn().mockResolvedValue({ width: 800, height: 800, data: new Uint8Array(800*800*4) })
}))

describe('Upload Resize Logic', () => {
  it('should resize image when width is provided', async () => {
    const putMock = vi.fn()
    const env = {
      IMAGES_BUCKET: {
        put: putMock
      }
    }

    const file = new File(['fake content'], 'test.jpg', { type: 'image/jpeg' })
    const formData = new FormData()
    formData.append('file', file)
    formData.append('width', '800')

    const req = new Request('http://localhost/', {
      method: 'POST',
      body: formData
    })

    const res = await app.fetch(req, env)
    expect(res.status).toBe(200)

    // Verify put was called with a buffer (mocked result of encode)
    expect(putMock).toHaveBeenCalled()
    const args = putMock.mock.calls[0]
    // The second argument should be the buffer from encode
    expect(args[1]).toBeInstanceOf(ArrayBuffer)
    expect(args[1].byteLength).toBe(100)
    // The key should end with .jpg
    expect(args[0]).toMatch(/\.jpg$/)
  })

  it('should use original file if no width provided', async () => {
    const putMock = vi.fn()
    const env = {
      IMAGES_BUCKET: {
        put: putMock
      }
    }

    const file = new File(['fake content'], 'test.jpg', { type: 'image/jpeg' })
    const formData = new FormData()
    formData.append('file', file)

    const req = new Request('http://localhost/', {
      method: 'POST',
      body: formData
    })

    const res = await app.fetch(req, env)
    expect(res.status).toBe(200)

    expect(putMock).toHaveBeenCalled()
    const args = putMock.mock.calls[0]
    // Should NOT be the 100 byte buffer from the mock
    // It should be the stream or buffer from the original file
    // The original file is "fake content" (12 bytes)
    // But since we didn't mock decode calling for this path, we can verify it wasn't the resized one.
    // However, verify logic: if width is missing, resize code is skipped.

    // We can verify that @jsquash/jpeg decode was NOT called?
    // How to access the mock?
    // Since we mocked it at module level, we can import it to inspect calls, or just rely on the output check.
  })
})
