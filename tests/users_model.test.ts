import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateUser, UpdateUser, createUser, NewUser } from '../src/models/users'
import { dbRun } from '../src/models/db'

// Mock dbRun
vi.mock('../src/models/db', () => ({
  dbRun: vi.fn(),
  dbFirst: vi.fn(),
  dbAll: vi.fn(),
}))

describe('User Model', () => {
  let mockDB: D1Database

  beforeEach(() => {
    vi.clearAllMocks()
    mockDB = {} as any // Dummy object, since we mock dbRun
  })

  describe('createUser', () => {
    it('should default role to "student" if empty string provided', async () => {
      const newUser: NewUser = {
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'hash',
        role: '', // Empty string
        active: 1
      }

      await createUser(mockDB, newUser)

      expect(dbRun).toHaveBeenCalledWith(
        mockDB,
        expect.stringContaining('INSERT INTO users'),
        ['Test User', 'test@example.com', 'hash', 'student', 1, 0] // Expect 'student' instead of ''
      )
    })
  })

  describe('updateUser', () => {
    it('should construct correct SQL for partial update', async () => {
      const updateData: UpdateUser = {
        name: 'New Name',
        role: 'admin'
      }
      const userId = 123

      await updateUser(mockDB, userId, updateData)

      expect(dbRun).toHaveBeenCalledWith(
        mockDB,
        expect.stringContaining('UPDATE users SET name = ?, role = ?, updated_at = datetime(\'now\') WHERE id = ?'),
        ['New Name', 'admin', 123]
      )
    })

    it('should handle all fields', async () => {
      const updateData: UpdateUser = {
        name: 'Name',
        email: 'email@example.com',
        role: 'student',
        active: 1,
        email_verified: 1,
        password_hash: 'hash'
      }
      const userId = 456

      await updateUser(mockDB, userId, updateData)

      expect(dbRun).toHaveBeenCalledWith(
        mockDB,
        expect.stringContaining('UPDATE users SET name = ?, email = ?, role = ?, active = ?, email_verified = ?, password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?'),
        ['Name', 'email@example.com', 'student', 1, 1, 'hash', 456]
      )
    })

    it('should do nothing if no fields provided', async () => {
      const updateData: UpdateUser = {}
      const userId = 789

      await updateUser(mockDB, userId, updateData)

      expect(dbRun).not.toHaveBeenCalled()
    })

    it('should default role to "student" if empty string provided during update', async () => {
      const updateData: UpdateUser = {
        role: ''
      }
      const userId = 999

      await updateUser(mockDB, userId, updateData)

      expect(dbRun).toHaveBeenCalledWith(
        mockDB,
        expect.stringContaining('UPDATE users SET role = ?, updated_at = datetime(\'now\') WHERE id = ?'),
        ['student', 999] // Expect 'student' instead of ''
      )
    })
  })
})
