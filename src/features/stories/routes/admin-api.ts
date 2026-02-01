import { Hono } from 'hono'
import { CloudflareBindings } from '../../../types'
import { updateStoryStatus, getStory, deleteStory, updateStoryThumbnail } from '../models/stories'
import { processStoryApproval } from '../services/story-processor'
import { getCurrentUser } from '../../../auth-utils'
import { cleanupContentImages } from '../../../lib/media-cleanup'
import { processImage } from '../../../lib/image-processing'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.post('/:id/approve', async (c) => {
  const idStr = c.req.param('id')
  if (!/^\d+$/.test(idStr)) return c.json({ error: 'Invalid ID' }, 400)
  const id = Number(idStr)

  const user = await getCurrentUser(c)
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const story = await getStory(c.env.DB, id)
  if (!story) {
    return c.json({ error: 'Story not found' }, 404)
  }

  // Parse optional body for notes
  let notes = ''
  try {
      const body = await c.req.json().catch(() => ({}))
      notes = body.notes || ''
  } catch(e) {}

  await updateStoryStatus(c.env.DB, id, 'approved', user.id, notes)

  // Trigger processing
  if (c.executionCtx) {
    c.executionCtx.waitUntil(processStoryApproval(c.env.DB, c.env.IMAGES_BUCKET, id))
  } else {
    // Fallback for environments without executionCtx
    await processStoryApproval(c.env.DB, c.env.IMAGES_BUCKET, id)
  }

  return c.json({ success: true, status: 'approved' })
})

app.post('/:id/reject', async (c) => {
  const idStr = c.req.param('id')
  if (!/^\d+$/.test(idStr)) return c.json({ error: 'Invalid ID' }, 400)
  const id = Number(idStr)

  const user = await getCurrentUser(c)
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const story = await getStory(c.env.DB, id)
  if (!story) {
    return c.json({ error: 'Story not found' }, 404)
  }

  let notes = ''
  try {
      const body = await c.req.json()
      notes = body.notes
  } catch(e) {
      return c.json({ error: 'Invalid JSON body' }, 400)
  }

  if (!notes || typeof notes !== 'string' || notes.trim() === '') {
      return c.json({ error: 'Moderation notes are required for rejection' }, 400)
  }

  await updateStoryStatus(c.env.DB, id, 'rejected', user.id, notes)

  return c.json({ success: true, status: 'rejected' })
})

app.delete('/:id', async (c) => {
  const idStr = c.req.param('id')
  if (!/^\d+$/.test(idStr)) return c.json({ error: 'Invalid ID' }, 400)
  const id = Number(idStr)

  const user = await getCurrentUser(c)
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const story = await getStory(c.env.DB, id)
  if (!story) {
    return c.json({ error: 'Story not found' }, 404)
  }

  // Cleanup aligned images and thumbnail
  const validOrigins: string[] = []
  if (c.env.MEDIA_ORIGIN) validOrigins.push(c.env.MEDIA_ORIGIN)
  if (c.env.BASE_URL) {
    try {
      validOrigins.push(new URL(c.env.BASE_URL).origin)
    } catch (e) {}
  }
  try {
    validOrigins.push(new URL(c.req.url).origin)
  } catch (e) {}

  await cleanupContentImages(
    c.env.IMAGES_BUCKET,
    [story.story_text, story.analysis_text],
    [story.thumbnail_url],
    validOrigins
  )

  const result = await deleteStory(c.env.DB, id)
  if (result === 0) {
    return c.json({ error: 'Not Found' }, 404)
  }

  // Delete from R2 if needed (Original File)
  if (story.r2_key && story.r2_key !== 'text-submission') {
    try {
      await c.env.IMAGES_BUCKET.delete(story.r2_key)
    } catch (e) {
      console.error('Error deleting from R2:', e)
    }
  }

  return c.json({ success: true })
})

app.post('/:id/thumbnail', async (c) => {
  const idStr = c.req.param('id')
  if (!/^\d+$/.test(idStr)) return c.json({ error: 'Invalid ID' }, 400)
  const id = Number(idStr)

  const user = await getCurrentUser(c)
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  let thumbnailUrl = ''
  try {
      const body = await c.req.json()
      thumbnailUrl = body.thumbnailUrl
  } catch(e) {
      return c.json({ error: 'Invalid JSON body' }, 400)
  }

  if (!thumbnailUrl || typeof thumbnailUrl !== 'string') {
      return c.json({ error: 'thumbnailUrl is required' }, 400)
  }

  if (thumbnailUrl.startsWith('//')) {
    return c.json({ error: 'Protocol-relative URLs are not allowed' }, 400)
  }

  // Allow relative URLs (starting with /) without further validation
  if (!thumbnailUrl.startsWith('/')) {
    try {
      const url = new URL(thumbnailUrl)
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return c.json({ error: 'Invalid protocol. Must be http or https.' }, 400)
      }

      const validOrigins: string[] = []
      if (c.env.MEDIA_ORIGIN) validOrigins.push(c.env.MEDIA_ORIGIN)
      if (c.env.BASE_URL) {
        try {
          validOrigins.push(new URL(c.env.BASE_URL).origin)
        } catch (e) {}
      }

      // Also allow the current request's origin (e.g. preview environments)
      try {
        validOrigins.push(new URL(c.req.url).origin)
      } catch (e) {}

      if (validOrigins.length > 0) {
        if (!validOrigins.includes(url.origin)) {
          return c.json({ error: 'Invalid origin' }, 400)
        }
      } else {
        // Allow localhost in development if no env vars set, but typically we should strict fail
        // Per instructions, we compare against configured values.
        // If nothing configured, we'll reject to be safe.
        return c.json({ error: 'Server configuration error: No allowed media origins' }, 500)
      }
    } catch (e) {
      return c.json({ error: 'Invalid URL' }, 400)
    }
  }

  const changes = await updateStoryThumbnail(c.env.DB, id, thumbnailUrl)
  if (changes === 0) {
    return c.json({ error: 'Not Found' }, 404)
  }

  return c.json({ success: true })
})

app.post('/:id/thumbnail-upload', async (c) => {
  const idStr = c.req.param('id')
  if (!/^\d+$/.test(idStr)) return c.json({ error: 'Invalid ID' }, 400)
  const id = Number(idStr)

  const user = await getCurrentUser(c)
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const story = await getStory(c.env.DB, id)
  if (!story) {
    return c.json({ error: 'Story not found' }, 404)
  }

  // Parse Body
  let body: any
  try {
      body = await c.req.parseBody()
  } catch (e) {
      return c.json({ error: 'Invalid Form Data' }, 400)
  }

  const file = body['file']
  if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file uploaded' }, 400)
  }

  // Determine Target Width
  let targetWidth: number | undefined = 800
  if (body['width']) {
      const w = parseInt(body['width'] as string, 10)
      if (!Number.isNaN(w)) targetWidth = w
  }

  // Process Image
  const { data: fileData, contentType } = await processImage(file, targetWidth)

  // Deterministic Key
  const newKey = `stories/${id}/thumbnail.jpg`

  // Cleanup Old Thumbnail if different
  if (story.thumbnail_url) {
      let existingKey: string | null = null
      const url = story.thumbnail_url

      if (url.startsWith('/media/')) {
          existingKey = url.replace('/media/', '').split('?')[0]
      } else {
          try {
              const u = new URL(url)
              if (u.pathname.startsWith('/media/')) {
                  existingKey = u.pathname.replace('/media/', '')
              }
          } catch(e) {}
      }

      // If existing key is valid and NOT the new key, delete it.
      if (existingKey && existingKey !== newKey) {
          try {
              await c.env.IMAGES_BUCKET.delete(existingKey)
          } catch (e) {
              console.error('Error deleting old thumbnail:', e)
          }
      }
  }

  // Upload New (Overwrite)
  await c.env.IMAGES_BUCKET.put(newKey, fileData, {
      httpMetadata: { contentType }
  })

  // Update DB with Cache Busting
  const newUrl = `/media/${newKey}?v=${Date.now()}`
  await updateStoryThumbnail(c.env.DB, id, newUrl)

  return c.json({ success: true, url: newUrl })
})

export default app
