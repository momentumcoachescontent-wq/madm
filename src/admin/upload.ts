import { Hono } from 'hono'
import { decode as decodeJpeg, encode as encodeJpeg } from '@jsquash/jpeg'
import { decode as decodePng } from '@jsquash/png'
import resize from '@jsquash/resize'

type Bindings = {
  IMAGES_BUCKET: R2Bucket
}

const app = new Hono<{ Bindings: Bindings }>()

app.post('/', async (c) => {
  try {
    const body = await c.req.parseBody()
    const file = body['file'] || body['image'] // Support both for backward compatibility

    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file uploaded' }, 400)
    }

    let fileData: ArrayBuffer | ReadableStream = file.stream()
    let contentType = file.type
    // contentLength isn't strictly needed for R2 put as it calculates it, or we pass buffer.

    // Resizing Logic
    const widthStr = body['width']
    if (widthStr && typeof widthStr === 'string' && /^\d+$/.test(widthStr)) {
        const targetWidth = parseInt(widthStr, 10)
        // Limit max width to avoid memory issues and abuse
        if (targetWidth > 0 && targetWidth <= 2000) {
            try {
                // Determine format
                let imageData: ImageData | null = null
                const buffer = await file.arrayBuffer()

                if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                    imageData = await decodeJpeg(buffer)
                } else if (file.type === 'image/png') {
                    imageData = await decodePng(buffer)
                }

                if (imageData) {
                    // Calculate height to maintain aspect ratio
                    const targetHeight = Math.round(imageData.height * (targetWidth / imageData.width))

                    const resizedData = await resize(imageData, {
                        width: targetWidth,
                        height: targetHeight
                    })

                    // Always encode to JPEG for thumbnails to ensure consistency and compression
                    const newBuffer = await encodeJpeg(resizedData)

                    fileData = newBuffer
                    contentType = 'image/jpeg'
                }
            } catch (e) {
                console.error('Resize failed, falling back to original:', e)
                // fileData remains file.stream() (or we should reset it? file.stream() creates a new stream from Blob)
                fileData = file.stream()
                contentType = file.type
            }
        }
    }

    // Sanitize filename
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    let key = ""+Date.now()+"-"+sanitizedName

    // Ensure extension matches content type if we converted
    if (contentType === 'image/jpeg' && !key.toLowerCase().endsWith('.jpg') && !key.toLowerCase().endsWith('.jpeg')) {
        // If it was png, replace extension or append
        key = key.replace(/\.[^/.]+$/, "") + ".jpg"
    }

    // Upload to R2
    await c.env.IMAGES_BUCKET.put(key, fileData, {
      httpMetadata: {
        contentType: contentType,
      },
    })

    // Return URL.
    const url = "/media/"+key

    return c.json({ success: true, url: url, key: key, type: contentType })
  } catch (error) {
    console.error('Upload error:', error)
    return c.json({ error: 'Upload failed' }, 500)
  }
})

export default app
