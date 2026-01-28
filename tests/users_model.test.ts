import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateUser, UpdateUser } from '../src/models/users'
import { dbRun } from '../src/models/db'

// Mock dbRun
vi.mock('../src/models/db', () => ({
  dbRun: vi.fn(),
  dbFirst: vi.fn(),
  dbAll: vi.fn(),
}))

describe('User Model - updateUser', () => {
  let mockDB: D1Database

  beforeEach(() => {
    vi.clearAllMocks()
    mockDB = {} as any // Dummy object, since we mock dbRun
  })

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
})
