import { describe, it, expect, vi } from 'vitest'
import { extractImageKeysFromHtml, cleanupContentImages } from '../src/lib/media-cleanup'

describe('Media Cleanup Logic', () => {
    const allowedOrigins = ['https://myapp.com', 'https://media.myapp.com']

    describe('extractImageKeysFromHtml', () => {
        it('should extract relative paths starting with /media/', () => {
            const html = '<img src="/media/relative.jpg">'
            // @ts-ignore
            const keys = extractImageKeysFromHtml(html, allowedOrigins)
            expect(keys).toEqual(['relative.jpg'])
        })

        it('should extract absolute URLs matching allowed origins', () => {
             const html = `
                <img src="https://myapp.com/media/app-domain.jpg">
                <img src="https://media.myapp.com/media/media-domain.jpg">
             `
             // @ts-ignore
             const keys = extractImageKeysFromHtml(html, allowedOrigins)
             // Use toContain because order might depend on implementation
             expect(keys).toContain('app-domain.jpg')
             expect(keys).toContain('media-domain.jpg')
             expect(keys).toHaveLength(2)
        })

        it('should ignore absolute URLs NOT matching allowed origins', () => {
             const html = '<img src="https://evil.com/media/evil.jpg">'
             // @ts-ignore
             const keys = extractImageKeysFromHtml(html, allowedOrigins)
             expect(keys).not.toContain('evil.jpg')
             expect(keys).toHaveLength(0)
        })

        it('should ignore absolute URLs if no allowed origins provided', () => {
             const html = '<img src="https://myapp.com/media/app-domain.jpg">'
             // @ts-ignore
             const keys = extractImageKeysFromHtml(html, [])
             expect(keys).toEqual([])
        })

        it('should handle malformed URLs gracefully', () => {
            const html = '<img src="not-a-url">'
            // @ts-ignore
            const keys = extractImageKeysFromHtml(html, allowedOrigins)
            expect(keys).toEqual([])
        })
    })

    describe('cleanupContentImages', () => {
        it('should delete keys from bucket including extra URLs', async () => {
            const deleteMock = vi.fn()
            const bucket = { delete: deleteMock } as any

            const contents = ['<img src="https://myapp.com/media/content.jpg">']
            const extraUrls = [
                'https://media.myapp.com/media/thumb.jpg',
                'https://other.com/media/ignored.jpg',
                '/media/relative-thumb.jpg',
                null,
                undefined
            ]

            // @ts-ignore
            await cleanupContentImages(bucket, contents, extraUrls, allowedOrigins)

            expect(deleteMock).toHaveBeenCalledTimes(1)
            // @ts-ignore
            const deletedKeys = deleteMock.mock.calls[0][0]

            // Should contain: content.jpg, thumb.jpg, relative-thumb.jpg
            expect(deletedKeys).toContain('content.jpg')
            expect(deletedKeys).toContain('thumb.jpg')
            expect(deletedKeys).toContain('relative-thumb.jpg')
            expect(deletedKeys).not.toContain('ignored.jpg')
            expect(deletedKeys.length).toBe(3)
        })

        it('should not call delete if no keys found', async () => {
            const deleteMock = vi.fn()
            const bucket = { delete: deleteMock } as any

            const contents = ['<p>No images here</p>']
            const extraUrls = ['https://external.com/media/foo.jpg'] // Ignored origin

            // @ts-ignore
            await cleanupContentImages(bucket, contents, extraUrls, allowedOrigins)

            expect(deleteMock).not.toHaveBeenCalled()
        })
    })
})
