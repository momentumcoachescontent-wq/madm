import { dbFirst, dbAll, dbRun } from './db'

export interface User {
  id: number
  name: string
  email: string
  password_hash: string
  role: 'student' | 'admin' | string
  active: number // 0 or 1
  email_verified: number // 0 or 1
  avatar_url?: string | null
  created_at: string
  updated_at?: string
}

export type NewUser = {
  name: string
  email: string
  password_hash: string
  role?: string
  active?: number
  email_verified?: number
  avatar_url?: string
}

/**
 * Get a user by ID
 */
export const getUserById = async (db: D1Database, id: number): Promise<User | null> => {
  return await dbFirst<User>(db, 'SELECT * FROM users WHERE id = ?', [id])
}

/**
 * Get a user by Email
 */
export const getUserByEmail = async (db: D1Database, email: string): Promise<User | null> => {
  return await dbFirst<User>(db, 'SELECT * FROM users WHERE email = ?', [email])
}

/**
 * Create a new user
 */
export const createUser = async (db: D1Database, user: NewUser) => {
  const role = user.role || 'student'
  const active = user.active !== undefined ? user.active : 1
  const email_verified = user.email_verified !== undefined ? user.email_verified : 0

  return await dbRun(
    db,
    `INSERT INTO users (name, email, password_hash, role, active, email_verified)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [user.name, user.email, user.password_hash, role, active, email_verified]
  )
}

/**
 * List users (for admin)
 */
export const listUsers = async (db: D1Database): Promise<User[]> => {
  return await dbAll<User>(db, 'SELECT * FROM users ORDER BY created_at DESC')
}

/**
 * Count total users
 */
export const countUsers = async (db: D1Database): Promise<number> => {
  const result = await dbFirst<{ count: number }>(db, 'SELECT COUNT(*) as count FROM users')
  return result?.count || 0
}
