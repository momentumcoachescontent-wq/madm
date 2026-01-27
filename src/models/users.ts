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

/**
 * Generate a random session token
 */
export function generateSessionToken(): string {
  // 128-bit random token -> 32 hex characters
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `session_${hex}`
}

/**
 * Get user from session token
 */
export const getUserFromSession = async (db: D1Database, sessionToken: string): Promise<User | null> => {
  const session = await dbFirst<any>(
    db,
    `SELECT s.*, u.id as user_id, u.email, u.name, u.avatar_url, u.role, u.active
     FROM user_sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.session_token = ?
     AND s.expires_at > datetime('now')
     AND u.active = 1`,
    [sessionToken]
  )

  if (!session) return null

  return {
    id: session.user_id,
    email: session.email,
    name: session.name,
    avatar_url: session.avatar_url,
    role: session.role,
    active: session.active,
    // These fields might not be needed for session user but satisfying User interface
    password_hash: '',
    email_verified: 1, // Assumed if active
    created_at: ''
  } as User
}

/**
 * Create a new session for user
 */
export const createSession = async (db: D1Database, userId: number): Promise<string> => {
  const token = generateSessionToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

  await dbRun(
    db,
    `INSERT INTO user_sessions (user_id, session_token, expires_at)
     VALUES (?, ?, ?)`,
    [userId, token, expiresAt.toISOString()]
  )

  return token
}

/**
 * Delete a session
 */
export const deleteSession = async (db: D1Database, sessionToken: string) => {
  return await dbRun(db, 'DELETE FROM user_sessions WHERE session_token = ?', [sessionToken])
}
