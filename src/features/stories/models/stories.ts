import { dbRun, dbAll, dbFirst } from '../../../models/db'

export interface Story {
  id: number
  user_id: number | null
  status: 'pending' | 'approved' | 'rejected'
  r2_key: string
  original_filename: string
  meta_title: string | null
  meta_author: string | null
  ip_address: string | null
  created_at: string
  updated_at: string
  moderated_by: number | null
  moderated_at: string | null
  moderation_notes: string | null
  file_hash: string | null
  submitter_alias: string | null
  slug: string | null
  story_text: string | null
  analysis_text: string | null
  excerpt: string | null
  thumbnail_url: string | null
  published_at: string | null
  tags: string | null
  views: number
  likes: number
}

export interface CreateStoryParams {
  user_id: number | null
  r2_key: string
  original_filename: string
  meta_title?: string | null
  meta_author?: string | null
  ip_address?: string | null
  story_text?: string | null
}

export const createStory = async (db: D1Database, params: CreateStoryParams) => {
  const query = `
    INSERT INTO stories (user_id, r2_key, original_filename, meta_title, meta_author, ip_address, story_text)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `
  const args = [
    params.user_id,
    params.r2_key,
    params.original_filename,
    params.meta_title ?? null,
    params.meta_author ?? null,
    params.ip_address ?? null,
    params.story_text ?? null
  ]
  return await dbRun(db, query, args)
}

export interface ListStoriesFilters {
  status?: string
  limit?: number
  offset?: number
}

export const listStories = async (db: D1Database, filters: ListStoriesFilters = {}) => {
  let query = `SELECT * FROM stories`
  const args: any[] = []
  const conditions: string[] = []

  if (filters.status) {
    conditions.push(`status = ?`)
    args.push(filters.status)
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(' AND ')
  }

  query += ` ORDER BY created_at DESC`

  if (filters.limit != null) {
    query += ` LIMIT ?`
    args.push(filters.limit)
    if (filters.offset != null) {
      query += ` OFFSET ?`
      args.push(filters.offset)
    }
  }

  return await dbAll<Story>(db, query, args)
}

export const getStory = async (db: D1Database, id: number) => {
  return await dbFirst<Story>(db, `SELECT * FROM stories WHERE id = ?`, [id])
}

export const updateStoryStatus = async (
  db: D1Database,
  id: number,
  status: 'approved' | 'rejected',
  moderatedBy: number,
  notes?: string
) => {
  const result = await dbRun(
    db,
    `UPDATE stories SET status = ?, moderated_by = ?, moderated_at = CURRENT_TIMESTAMP, moderation_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [status, moderatedBy, notes || null, id]
  )
  return result.changes
}

export const updateStoryThumbnail = async (
  db: D1Database,
  id: number,
  thumbnailUrl: string
) => {
  const result = await dbRun(
    db,
    `UPDATE stories SET thumbnail_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [thumbnailUrl, id]
  )
  return result.changes
}

export const deleteStory = async (db: D1Database, id: number) => {
  const result = await dbRun(db, `DELETE FROM stories WHERE id = ?`, [id])
  return result.changes
}

export const countStories = async (db: D1Database, filters: { status?: string } = {}) => {
  let query = `SELECT COUNT(*) as count FROM stories`
  const args: any[] = []

  if (filters.status) {
    query += ` WHERE status = ?`
    args.push(filters.status)
  }

  const result = await dbFirst<{ count: number }>(db, query, args)
  return result?.count ?? 0
}

// Public Methods

export interface PublicStoriesFilters {
  limit?: number
  offset?: number
  tag?: string
}

export const listPublicStories = async (db: D1Database, filters: PublicStoriesFilters = {}) => {
  let query = `SELECT * FROM stories WHERE status = 'approved'`
  const args: any[] = []

  if (filters.tag) {
    // Simple LIKE for comma separated tags.
    // Not perfect (e.g. 'art' matches 'party') but compliant with requirements.
    query += ` AND tags LIKE ?`
    args.push(`%${filters.tag}%`)
  }

  // Sort by published_at DESC (primary) or created_at DESC (fallback)
  query += ` ORDER BY published_at DESC, created_at DESC`

  if (filters.limit != null) {
    query += ` LIMIT ?`
    args.push(filters.limit)
    if (filters.offset != null) {
      query += ` OFFSET ?`
      args.push(filters.offset)
    }
  }

  return await dbAll<Story>(db, query, args)
}

export const getPublicStoryBySlug = async (db: D1Database, slug: string) => {
  return await dbFirst<Story>(db, `SELECT * FROM stories WHERE slug = ? AND status = 'approved'`, [slug])
}

export const incrementStoryView = async (db: D1Database, id: number) => {
  return await dbRun(db, `UPDATE stories SET views = views + 1 WHERE id = ?`, [id])
}

export const incrementStoryLike = async (db: D1Database, id: number) => {
  return await dbRun(db, `UPDATE stories SET likes = likes + 1 WHERE id = ?`, [id])
}
