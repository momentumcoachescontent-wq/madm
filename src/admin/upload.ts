import { Hono } from 'hono'
import { processImage } from '../lib/image-processing'

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

    // Parse target width
    const widthStr = body['width']
    let targetWidth: number | undefined
    if (widthStr && typeof widthStr === 'string' && /^\d+$/.test(widthStr)) {
        targetWidth = parseInt(widthStr, 10)
    }

    // Process Image (Resize/Convert if needed)
    const { data: fileData, contentType } = await processImage(file, targetWidth)

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
