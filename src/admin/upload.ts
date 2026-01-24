import { Hono } from 'hono'

type Bindings = {
  IMAGES_BUCKET: R2Bucket
}

const app = new Hono<{ Bindings: Bindings }>()

app.post('/', async (c) => {
  try {
    const body = await c.req.parseBody()
    const file = body['file'] || body['image'] // Support both for backward compatibility during transition, but prefer 'file'

    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file uploaded' }, 400)
    }

    // Sanitize filename
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const key = ""+Date.now()+"-"+sanitizedName

    // Upload to R2
    await c.env.IMAGES_BUCKET.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    })

    // Return URL.
    // We will serve these via a route /media/:key defined in the main app
    const url = "/media/"+key

    return c.json({ success: true, url: url, key: key, type: file.type })
  } catch (error) {
    console.error('Upload error:', error)
    return c.json({ error: 'Upload failed' }, 500)
  }
})

export default app
