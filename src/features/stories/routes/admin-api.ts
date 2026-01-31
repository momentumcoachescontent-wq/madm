import { Hono } from 'hono'
import { CloudflareBindings } from '../../../types'
import { updateStoryStatus, getStory } from '../models/stories'
import { processStoryApproval } from '../services/story-processor'
import { getCurrentUser } from '../../../auth-utils'

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

export default app
