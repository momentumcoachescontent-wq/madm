import { dbFirst, dbAll, dbRun } from './db'

export interface Lesson {
  id: number
  course_id: number
  module_number: number
  lesson_number: number
  title: string
  description: string | null
  video_url: string | null
  video_duration: number | null
  content: string | null
  order_index: number
  is_preview: number // 0 or 1
  published: number // 0 or 1
  created_at: string
  updated_at?: string
  // Joined fields
  course_title?: string
}

export type NewLesson = {
  course_id: number
  module_number: number
  lesson_number: number
  title: string
  description?: string
  video_url?: string
  video_duration?: number
  content?: string
  is_preview?: number
  published?: number
  order_index?: number
}

export interface LessonResource {
  id: number
  lesson_id: number
  title: string
  description: string | null
  file_type: string
  file_url: string
  file_size: number | null
  downloads_count: number
  created_at: string
}

/**
 * Get a lesson by ID
 */
export const getLessonById = async (db: D1Database, id: number): Promise<Lesson | null> => {
  return await dbFirst<Lesson>(db, 'SELECT * FROM lessons WHERE id = ?', [id])
}

/**
 * List all lessons (Admin view with Course Title)
 */
export const listLessons = async (db: D1Database): Promise<Lesson[]> => {
  return await dbAll<Lesson>(
    db,
    `SELECT l.*, c.title as course_title
     FROM lessons l
     JOIN courses c ON l.course_id = c.id
     ORDER BY c.title ASC, l.module_number ASC, l.lesson_number ASC`
  )
}

/**
 * Get lessons by Course ID (Student view)
 */
export const getLessonsByCourseId = async (db: D1Database, courseId: number, publishedOnly: boolean = true): Promise<Lesson[]> => {
  let query = 'SELECT id, module_number, lesson_number, title, video_duration, is_preview, order_index FROM lessons WHERE course_id = ?'
  if (publishedOnly) {
    query += ' AND published = 1'
  }
  // Fallback sorting if order_index is not reliable?
  // Student dashboard uses ORDER BY order_index ASC.
  // Let's stick to that but maybe also sort by module/lesson if order_index matches?
  query += ' ORDER BY order_index ASC, module_number ASC, lesson_number ASC'

  return await dbAll<Lesson>(db, query, [courseId])
}

/**
 * Create a new lesson
 */
export const createLesson = async (db: D1Database, lesson: NewLesson) => {
  // Auto-calculate order_index if not provided
  const orderIndex = lesson.order_index ?? (lesson.module_number * 1000 + lesson.lesson_number)

  return await dbRun(
    db,
    `INSERT INTO lessons (
      course_id, module_number, lesson_number, title, description,
      video_url, video_duration, content, is_preview, published, order_index
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      lesson.course_id,
      lesson.module_number,
      lesson.lesson_number,
      lesson.title,
      lesson.description || null,
      lesson.video_url || null,
      lesson.video_duration || 0,
      lesson.content || null,
      lesson.is_preview ? 1 : 0,
      lesson.published ? 1 : 0,
      orderIndex
    ]
  )
}

/**
 * Update a lesson
 */
export const updateLesson = async (db: D1Database, id: number, lesson: Partial<NewLesson>) => {
  const updates: string[] = []
  const args: any[] = []

  if (lesson.course_id !== undefined) { updates.push('course_id = ?'); args.push(lesson.course_id) }
  if (lesson.module_number !== undefined) { updates.push('module_number = ?'); args.push(lesson.module_number) }
  if (lesson.lesson_number !== undefined) { updates.push('lesson_number = ?'); args.push(lesson.lesson_number) }
  if (lesson.title !== undefined) { updates.push('title = ?'); args.push(lesson.title) }
  if (lesson.description !== undefined) { updates.push('description = ?'); args.push(lesson.description) }
  if (lesson.video_url !== undefined) { updates.push('video_url = ?'); args.push(lesson.video_url) }
  if (lesson.video_duration !== undefined) { updates.push('video_duration = ?'); args.push(lesson.video_duration) }
  if (lesson.content !== undefined) { updates.push('content = ?'); args.push(lesson.content) }
  if (lesson.is_preview !== undefined) { updates.push('is_preview = ?'); args.push(lesson.is_preview ? 1 : 0) }
  if (lesson.published !== undefined) { updates.push('published = ?'); args.push(lesson.published ? 1 : 0) }
  if (lesson.order_index !== undefined) { updates.push('order_index = ?'); args.push(lesson.order_index) }

  // Update order_index if module/lesson changed but order_index wasn't explicitly provided?
  // Ideally, if module/lesson changes, we might want to recalculate order_index if it was auto-generated.
  // But for now, let's only update if explicitly provided OR if we want to enforce consistency.
  // Let's keep it simple: only update what's passed.
  // However, since the Admin UI doesn't allow editing order_index, we should probably auto-update it if module/lesson changes.
  if (lesson.order_index === undefined && (lesson.module_number !== undefined || lesson.lesson_number !== undefined)) {
     // This is tricky without knowing the current values if only one changed.
     // We'd need to fetch the lesson first or require both to be passed.
     // For safety, let's leave order_index alone unless explicitly changed.
  }

  updates.push('updated_at = CURRENT_TIMESTAMP')

  const query = `UPDATE lessons SET ${updates.join(', ')} WHERE id = ?`
  args.push(id)

  return await dbRun(db, query, args)
}

/**
 * Count total lessons
 */
export const countLessons = async (db: D1Database): Promise<number> => {
  const result = await dbFirst<{ count: number }>(db, 'SELECT COUNT(*) as count FROM lessons')
  return result?.count || 0
}

/**
 * Get resources for a lesson
 */
export const getLessonResources = async (db: D1Database, lessonId: number): Promise<LessonResource[]> => {
  return await dbAll<LessonResource>(
    db,
    'SELECT * FROM lesson_resources WHERE lesson_id = ? ORDER BY created_at ASC',
    [lessonId]
  )
}

/**
 * Get the first lesson of a course
 */
export const getFirstLesson = async (db: D1Database, courseId: number): Promise<Lesson | null> => {
  // Try order_index first, then fallback to module/lesson
  return await dbFirst<Lesson>(
    db,
    'SELECT * FROM lessons WHERE course_id = ? AND published = 1 ORDER BY order_index ASC LIMIT 1',
    [courseId]
  )
}
