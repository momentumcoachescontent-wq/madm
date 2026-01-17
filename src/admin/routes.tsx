import { Hono } from 'hono'
import { adminMiddleware } from './middleware'
import { dashboard } from './dashboard'
import blog from './blog'
import courses from './courses'

// Create the admin app
const admin = new Hono<{ Bindings: any }>()

// Apply middleware to all routes
admin.use('*', adminMiddleware)

// Mount sub-apps/routes
admin.route('/', dashboard)
admin.route('/blog', blog)
admin.route('/courses', courses)

// Placeholder routes for now
admin.get('/media', (c) => c.text('Media Management - Coming Soon'))

// Media Upload
admin.post('/api/upload', async (c) => {
  try {
    const body = await c.req.parseBody()
    const file = body['file']

    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file uploaded' }, 400)
    }

    const buffer = await file.arrayBuffer()
    const data = new Uint8Array(buffer)

    // Limit size (e.g., 5MB)
    if (data.length > 5 * 1024 * 1024) {
      return c.json({ error: 'File too large (max 5MB)' }, 400)
    }

    const result = await c.env.DB.prepare(`
      INSERT INTO media_files (filename, content_type, size, data)
      VALUES (?, ?, ?, ?)
    `).bind(file.name, file.type, file.size, data).run()

    const id = result.meta.last_row_id

    return c.json({
      success: true,
      url: `/media/${id}`,
      id: id,
      filename: file.name
    })
  } catch (error) {
    console.error('Upload error:', error)
    return c.json({ error: 'Error uploading file' }, 500)
  }
})

export { admin }
