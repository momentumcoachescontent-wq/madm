import { dbFirst, dbAll, dbRun } from './db'

export interface BlogPost {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string | null
  image_url: string | null
  hashtags: string | null
  published: number // 0 or 1
  scheduled_at: string | null
  views: number
  created_at: string
  updated_at: string
}

export type NewBlogPost = {
  title: string
  slug: string
  content: string
  excerpt?: string
  image_url?: string
  hashtags?: string
  published?: number
  scheduled_at?: string | null
}

export type UpdateBlogPost = Partial<NewBlogPost>

export interface ListBlogPostsOptions {
  publishedOnly?: boolean
  limit?: number
  offset?: number
  excludeId?: number
  orderBy?: 'created_at' | 'random' | 'scheduled_at'
}

/**
 * Get a blog post by ID
 */
export const getBlogPostById = async (db: D1Database, id: number): Promise<BlogPost | null> => {
  return await dbFirst<BlogPost>(db, 'SELECT * FROM blog_posts WHERE id = ?', [id])
}

/**
 * Get a blog post by Slug
 */
export const getBlogPostBySlug = async (db: D1Database, slug: string, opts: { publishedOnly?: boolean } = {}): Promise<BlogPost | null> => {
  let query = 'SELECT * FROM blog_posts WHERE slug = ?'

  if (opts.publishedOnly) {
    query += " AND published = 1 AND (scheduled_at IS NULL OR scheduled_at <= datetime('now'))"
  }

  return await dbFirst<BlogPost>(db, query, [slug])
}

/**
 * List blog posts with various filters
 */
export const listBlogPosts = async (db: D1Database, opts: ListBlogPostsOptions = {}): Promise<BlogPost[]> => {
  let query = 'SELECT * FROM blog_posts'
  const args: any[] = []
  const conditions: string[] = []

  if (opts.publishedOnly) {
    conditions.push("published = 1 AND (scheduled_at IS NULL OR scheduled_at <= datetime('now'))")
  }

  if (opts.excludeId) {
    conditions.push("id != ?")
    args.push(opts.excludeId)
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ')
  }

  if (opts.orderBy === 'random') {
    query += ' ORDER BY RANDOM()'
  } else if (opts.orderBy === 'scheduled_at' || opts.publishedOnly) {
    // Default for public listing usually
    query += ' ORDER BY COALESCE(scheduled_at, created_at) DESC'
  } else {
    // Default (Admin) order
    query += ' ORDER BY created_at DESC'
  }

  if (opts.limit) {
    query += ' LIMIT ?'
    args.push(opts.limit)
  }

  if (opts.offset) {
    query += ' OFFSET ?'
    args.push(opts.offset)
  }

  return await dbAll<BlogPost>(db, query, args)
}

/**
 * Count blog posts
 */
export const countBlogPosts = async (db: D1Database, opts: { publishedOnly?: boolean } = {}): Promise<number> => {
  let query = 'SELECT COUNT(*) as count FROM blog_posts'
  const conditions: string[] = []

  if (opts.publishedOnly) {
    conditions.push("published = 1 AND (scheduled_at IS NULL OR scheduled_at <= datetime('now'))")
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ')
  }

  const result = await dbFirst<{ count: number }>(db, query)
  return result?.count || 0
}

/**
 * Create a new blog post
 */
export const createBlogPost = async (db: D1Database, post: NewBlogPost) => {
  return await dbRun(
    db,
    `INSERT INTO blog_posts (title, slug, content, excerpt, image_url, hashtags, published, scheduled_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [
      post.title,
      post.slug,
      post.content,
      post.excerpt || null,
      post.image_url || null,
      post.hashtags || null,
      post.published !== undefined ? post.published : 0,
      post.scheduled_at || null
    ]
  )
}

/**
 * Update a blog post
 */
export const updateBlogPost = async (db: D1Database, id: number, post: UpdateBlogPost) => {
  // We need to build the update query dynamically based on provided fields
  const updates: string[] = []
  const args: any[] = []

  if (post.title !== undefined) { updates.push('title = ?'); args.push(post.title) }
  if (post.slug !== undefined) { updates.push('slug = ?'); args.push(post.slug) }
  if (post.content !== undefined) { updates.push('content = ?'); args.push(post.content) }
  if (post.excerpt !== undefined) { updates.push('excerpt = ?'); args.push(post.excerpt) }
  if (post.image_url !== undefined) { updates.push('image_url = ?'); args.push(post.image_url) }
  if (post.hashtags !== undefined) { updates.push('hashtags = ?'); args.push(post.hashtags) }
  if (post.published !== undefined) { updates.push('published = ?'); args.push(post.published) }
  if (post.scheduled_at !== undefined) { updates.push('scheduled_at = ?'); args.push(post.scheduled_at) }

  // Always update updated_at
  updates.push('updated_at = CURRENT_TIMESTAMP')

  const query = `UPDATE blog_posts SET ${updates.join(', ')} WHERE id = ?`
  args.push(id)

  return await dbRun(db, query, args)
}

/**
 * Increment blog post views
 */
export const incrementBlogPostViews = async (db: D1Database, id: number) => {
  return await dbRun(db, 'UPDATE blog_posts SET views = views + 1 WHERE id = ?', [id])
}

/**
 * Delete a blog post
 */
export const deleteBlogPost = async (db: D1Database, id: number) => {
  return await dbRun(db, 'DELETE FROM blog_posts WHERE id = ?', [id])
}
