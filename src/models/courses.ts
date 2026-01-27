import { dbFirst, dbAll, dbRun } from './db'

export interface Course {
  id: number
  title: string
  slug: string
  subtitle: string | null
  description: string | null
  price: number
  currency: string
  duration_weeks: number
  level: string
  featured_image: string | null
  published: number // 0 or 1
  featured?: number
  enrollment_count?: number
  rating?: number
  instructor_name?: string
  instructor_bio?: string
  what_you_learn?: string
  course_content?: string
  requirements?: string
  target_audience?: string
  testimonials?: string
  created_at: string
  updated_at?: string
}

export type NewCourse = {
  title: string
  slug: string
  subtitle?: string
  description?: string
  price?: number
  currency?: string
  duration_weeks?: number
  level?: string
  featured_image?: string
  published?: number
}

/**
 * Get a course by ID
 */
export const getCourseById = async (db: D1Database, id: number): Promise<Course | null> => {
  return await dbFirst<Course>(db, 'SELECT * FROM courses WHERE id = ?', [id])
}

/**
 * Get a course by Slug
 */
export const getCourseBySlug = async (db: D1Database, slug: string): Promise<Course | null> => {
  return await dbFirst<Course>(db, 'SELECT * FROM courses WHERE slug = ?', [slug])
}

/**
 * List all courses (Admin)
 */
export const listCourses = async (db: D1Database): Promise<Course[]> => {
  return await dbAll<Course>(db, 'SELECT * FROM courses ORDER BY created_at DESC')
}

/**
 * List published courses (Public)
 */
export const listPublishedCourses = async (db: D1Database): Promise<Course[]> => {
  return await dbAll<Course>(db, 'SELECT * FROM courses WHERE published = 1 ORDER BY created_at DESC')
}

/**
 * Count total courses
 */
export const countCourses = async (db: D1Database): Promise<number> => {
  const result = await dbFirst<{ count: number }>(db, 'SELECT COUNT(*) as count FROM courses')
  return result?.count || 0
}

/**
 * Create a new course
 */
export const createCourse = async (db: D1Database, course: NewCourse) => {
  return await dbRun(
    db,
    `INSERT INTO courses (title, slug, subtitle, description, price, currency, duration_weeks, level, featured_image, published, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      course.title,
      course.slug,
      course.subtitle || null,
      course.description || null,
      course.price || 0,
      course.currency || 'USD',
      course.duration_weeks || 0,
      course.level || 'all_levels',
      course.featured_image || null,
      course.published ? 1 : 0
    ]
  )
}

/**
 * Update a course
 */
export const updateCourse = async (db: D1Database, id: number, course: Partial<NewCourse>) => {
  const updates: string[] = []
  const args: any[] = []

  if (course.title !== undefined) { updates.push('title = ?'); args.push(course.title) }
  if (course.slug !== undefined) { updates.push('slug = ?'); args.push(course.slug) }
  if (course.subtitle !== undefined) { updates.push('subtitle = ?'); args.push(course.subtitle) }
  if (course.description !== undefined) { updates.push('description = ?'); args.push(course.description) }
  if (course.price !== undefined) { updates.push('price = ?'); args.push(course.price) }
  if (course.currency !== undefined) { updates.push('currency = ?'); args.push(course.currency) }
  if (course.duration_weeks !== undefined) { updates.push('duration_weeks = ?'); args.push(course.duration_weeks) }
  if (course.level !== undefined) { updates.push('level = ?'); args.push(course.level) }
  if (course.featured_image !== undefined) { updates.push('featured_image = ?'); args.push(course.featured_image) }
  if (course.published !== undefined) { updates.push('published = ?'); args.push(course.published ? 1 : 0) }

  if (updates.length === 0) return { success: true } // Nothing to update

  const query = `UPDATE courses SET ${updates.join(', ')} WHERE id = ?`
  args.push(id)

  return await dbRun(db, query, args)
}
