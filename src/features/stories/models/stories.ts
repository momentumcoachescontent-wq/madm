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
}

export interface CreateStoryParams {
  user_id: number | null
  r2_key: string
  original_filename: string
  meta_title?: string | null
  meta_author?: string | null
  ip_address?: string | null
}

export const createStory = async (db: D1Database, params: CreateStoryParams) => {
  const query = `
    INSERT INTO stories (user_id, r2_key, original_filename, meta_title, meta_author, ip_address)
    VALUES (?, ?, ?, ?, ?, ?)
  `
  const args = [
    params.user_id,
    params.r2_key,
    params.original_filename,
    params.meta_title ?? null,
    params.meta_author ?? null,
    params.ip_address ?? null
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

  if (filters.limit) {
    query += ` LIMIT ?`
    args.push(filters.limit)
    if (filters.offset) {
      query += ` OFFSET ?`
      args.push(filters.offset)
    }
  }

  return await dbAll<Story>(db, query, args)
}

export const getStory = async (db: D1Database, id: number) => {
  return await dbFirst<Story>(db, `SELECT * FROM stories WHERE id = ?`, [id])
}

export const updateStoryStatus = async (db: D1Database, id: number, status: 'approved' | 'rejected') => {
  return await dbRun(db, `UPDATE stories SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [status, id])
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
