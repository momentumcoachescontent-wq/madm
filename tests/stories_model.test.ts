import { describe, it, expect, vi, beforeEach } from 'vitest'
import { listStories, updateStoryStatus } from '../src/features/stories/models/stories'

describe('Stories Model', () => {
  let mockDB: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockDB = {
      prepare: vi.fn(function(this: any) { return this }),
      bind: vi.fn(function(this: any) { return this }),
      all: vi.fn(),
      run: vi.fn(),
    }
  })

  it('listStories: correctly handles limit 0 (explicit null check)', async () => {
    mockDB.all.mockResolvedValue({ results: [] })

    // limit: 0, offset: 0
    await listStories(mockDB, { limit: 0, offset: 0 })

    // Check that LIMIT and OFFSET were appended
    // The query string is constructed in the function, so we check the prepare call
    const callArgs = mockDB.prepare.mock.calls[0]
    const query = callArgs[0]

    expect(query).toContain('LIMIT ?')
    expect(query).toContain('OFFSET ?')

    // Check bind args
    const bindArgs = mockDB.bind.mock.calls[0]
    // The order of bind args depends on other filters. Here no status filter.
    // So args should be [limit, offset]
    expect(bindArgs).toEqual([0, 0])
  })

  it('listStories: correctly handles limit 0 without offset', async () => {
    mockDB.all.mockResolvedValue({ results: [] })

    await listStories(mockDB, { limit: 0 })

    const callArgs = mockDB.prepare.mock.calls[0]
    const query = callArgs[0]

    expect(query).toContain('LIMIT ?')
    expect(query).not.toContain('OFFSET ?')

    const bindArgs = mockDB.bind.mock.calls[0]
    expect(bindArgs).toEqual([0])
  })

  it('updateStoryStatus: returns changes count', async () => {
    // Mock update success (1 change)
    mockDB.run.mockResolvedValueOnce({ meta: { changes: 1 } })
    const result1 = await updateStoryStatus(mockDB, 1, 'approved')
    expect(result1).toBe(1)

    // Mock update failure (0 changes - id not found)
    mockDB.run.mockResolvedValueOnce({ meta: { changes: 0 } })
    const result2 = await updateStoryStatus(mockDB, 999, 'rejected')
    expect(result2).toBe(0)
  })
})
