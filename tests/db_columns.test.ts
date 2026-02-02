import { describe, it, expect, vi, beforeEach } from 'vitest'
import { listBlogPosts } from '../src/features/blog/models/blog'
import { listPublishedCourses } from '../src/features/courses/models/courses'

describe('Database Columns Optimization', () => {
  let mockDB: D1Database
  let mockAll: any
  let mockBind: any
  let mockPrepare: any

  beforeEach(() => {
    mockAll = vi.fn().mockResolvedValue({ results: [] })
    mockBind = vi.fn().mockReturnValue({ all: mockAll })
    mockPrepare = vi.fn().mockReturnValue({ bind: mockBind })

    mockDB = {
        prepare: mockPrepare,
    } as unknown as D1Database
  })

  it('listBlogPosts should select all columns by default', async () => {
    await listBlogPosts(mockDB)
    expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM blog_posts')
    )
  })

  it('listBlogPosts should select specific columns when requested', async () => {
    await listBlogPosts(mockDB, { columns: ['slug', 'created_at'] })
    expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('SELECT slug, created_at FROM blog_posts')
    )
  })

  it('listBlogPosts should filter out invalid columns', async () => {
    await listBlogPosts(mockDB, { columns: ['slug', 'invalid_col', 'drop table'] })
    expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('SELECT slug FROM blog_posts')
    )
  })

  it('listBlogPosts should fallback to * if all columns are invalid', async () => {
    await listBlogPosts(mockDB, { columns: ['invalid_col'] })
    expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM blog_posts')
    )
  })

  it('listPublishedCourses should select all columns by default', async () => {
    await listPublishedCourses(mockDB)
    expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM courses')
    )
  })

  it('listPublishedCourses should select specific columns when requested', async () => {
    await listPublishedCourses(mockDB, { columns: ['slug', 'price'] })
    expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('SELECT slug, price FROM courses')
    )
  })

  it('listPublishedCourses should filter out invalid columns', async () => {
    await listPublishedCourses(mockDB, { columns: ['slug', 'invalid_col'] })
    expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('SELECT slug FROM courses')
    )
  })

  it('listPublishedCourses should fallback to * if all columns are invalid', async () => {
    await listPublishedCourses(mockDB, { columns: ['invalid_col'] })
    expect(mockPrepare).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM courses')
    )
  })
})
