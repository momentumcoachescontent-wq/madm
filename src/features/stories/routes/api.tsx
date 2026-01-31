import { Hono } from 'hono'
import { CloudflareBindings } from '../../../types'
import { createStory, getStoryByHash } from '../models/stories'
import { getCurrentUser } from '../../../auth-utils'

const storyApiRoutes = new Hono<{ Bindings: CloudflareBindings }>()

async function checkRateLimit(db: D1Database, ip: string): Promise<boolean> {
  const key = `ip:${ip}:stories_submission`
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 hour
  const limit = 5

  const record = await db.prepare('SELECT * FROM api_rate_limits WHERE key = ?').bind(key).first<{ count: number, reset_at: number }>()

  if (record) {
    if (now > record.reset_at) {
      // Reset
      await db.prepare('UPDATE api_rate_limits SET count = 1, reset_at = ? WHERE key = ?').bind(now + windowMs, key).run()
      return true
    } else {
      if (record.count >= limit) {
        return false
      }
      // Increment
      await db.prepare('UPDATE api_rate_limits SET count = count + 1 WHERE key = ?').bind(key).run()
      return true
    }
  } else {
    // Create
    await db.prepare('INSERT INTO api_rate_limits (key, count, reset_at) VALUES (?, 1, ?)').bind(key, now + windowMs).run()
    return true
  }
}

async function calculateHash(text: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

function extractMeta(html: string, targetName: string): string | null {
  const metaTags = html.match(/<meta\s+[^>]*>/gi) || []
  for (const tag of metaTags) {
    const nameMatch = tag.match(/name\s*=\s*(?:"([^"]*)"|'([^']*)')/i)
    const name = nameMatch ? (nameMatch[1] || nameMatch[2]) : null

    if (name === targetName) {
      const contentMatch = tag.match(/content\s*=\s*(?:"([^"]*)"|'([^']*)')/i)
      return contentMatch ? (contentMatch[1] || contentMatch[2]) : null
    }
  }
  return null
}

storyApiRoutes.post('/submissions', async (c) => {
  try {
    // 1. IP & Rate Limiting
    let ipAddress = c.req.header('CF-Connecting-IP') ?? 'unknown'
    if (ipAddress === 'unknown' && c.req.header('host')?.includes('localhost')) {
      ipAddress = '127.0.0.1'
    }

    const allowed = await checkRateLimit(c.env.DB, ipAddress)
    if (!allowed) {
      console.log(`Rate limit exceeded for IP: ${ipAddress}`)
      return c.json({ error: 'Too many requests. Please try again later.' }, 429)
    }

    // 2. Parse Body
    const body = await c.req.parseBody()
    const file = body['file']
    const alias = body['alias'] as string | undefined

    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file uploaded' }, 400)
    }

    // 3. Validation
    if (!file.name.endsWith('.html') && file.type !== 'text/html') {
      return c.json({ error: 'Invalid file type. Only .html is allowed.' }, 400)
    }

    let maxBytes = 3 * 1024 * 1024 // Default 3MB
    if (c.env.MAX_UPLOAD_BYTES && /^\d+$/.test(c.env.MAX_UPLOAD_BYTES)) {
      const parsed = parseInt(c.env.MAX_UPLOAD_BYTES, 10)
      if (!Number.isNaN(parsed) && parsed > 0) {
        maxBytes = parsed
      }
    }

    if (file.size > maxBytes) {
      return c.json({ error: 'File too large' }, 413)
    }

    const content = await file.text()
    const meta_title = extractMeta(content, 'madm:title')
    const meta_author = extractMeta(content, 'madm:author')
    const hasStorySection = /<section\s+[^>]*data-madm\s*=\s*["']story["'][^>]*>/i.test(content)

    if (!meta_title || !meta_author || !hasStorySection) {
      return c.json({ error: 'Invalid file format. Missing required metadata (madm:title, madm:author) or sections (data-madm="story").' }, 400)
    }

    // 4. Hash & Duplicate Check
    const fileHash = await calculateHash(content)
    const existing = await getStoryByHash(c.env.DB, fileHash)
    if (existing) {
      return c.json({ error: 'This story has already been submitted.' }, 409)
    }

    // 5. R2 Upload
    const timestamp = Date.now()
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const r2Key = `stories/${timestamp}-${sanitizedFilename}`

    await c.env.IMAGES_BUCKET.put(r2Key, content, {
      httpMetadata: {
        contentType: 'text/html',
      },
    })

    // 6. DB Insert
    const user = await getCurrentUser(c)
    const userId = user ? user.id : null

    const storeIp = c.env.STORE_CLIENT_IP === 'true'
    const storedIp = storeIp ? ipAddress : null

    const result = await createStory(c.env.DB, {
      user_id: userId,
      r2_key: r2Key,
      original_filename: file.name,
      file_hash: fileHash,
      submitter_alias: alias || null,
      meta_title,
      meta_author,
      ip_address: storedIp
    })

    const submissionId = result.last_row_id

    // 7. Audit Log
    console.log(`[AUDIT] Story submitted. ID: ${submissionId}, IP: ${ipAddress}, User: ${userId || 'Anon'}, Hash: ${fileHash}`)

    return c.json({
      success: true,
      submissionId,
      status: 'pending',
      message: 'Story submitted successfully'
    }, 201)

  } catch (error) {
    console.error('Error submitting story API:', error)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

export { storyApiRoutes }
