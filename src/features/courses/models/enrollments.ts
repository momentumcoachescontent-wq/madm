import { dbFirst, dbAll, dbRun } from '../../../models/db'

export interface Enrollment {
  id: number
  user_id: number
  course_id: number
  payment_id: string | null
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed'
  amount_paid: number
  currency: string
  payment_method: string | null
  enrolled_at: string
  expires_at: string | null
  access_revoked: number // 0 or 1
  completed: number // 0 or 1
  completion_date: string | null
  certificate_issued: number // 0 or 1
  updated_at?: string
}

export type NewEnrollment = {
  user_id: number
  course_id: number
  payment_id?: string
  payment_status?: string
  amount_paid: number
  currency?: string
  payment_method?: string
  expires_at?: string
  access_revoked?: number
}

export interface StudentProgress {
  id: number
  user_id: number
  lesson_id: number
  course_id: number
  completed: number
  progress_percentage: number
  time_spent: number
  last_position: number
  notes: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface Certificate {
  id: number
  user_id: number
  course_id: number
  enrollment_id: number
  certificate_code: string
  issue_date: string
  certificate_url: string | null
  verified: number
}

/**
 * Get enrollment by user and course
 */
export const getEnrollment = async (db: D1Database, userId: number, courseId: number): Promise<Enrollment | null> => {
  return await dbFirst<Enrollment>(
    db,
    'SELECT * FROM paid_enrollments WHERE user_id = ? AND course_id = ?',
    [userId, courseId]
  )
}

/**
 * Get enrollment by payment ID
 */
export const getEnrollmentByPaymentId = async (db: D1Database, paymentId: string, provider: string): Promise<Enrollment | null> => {
  return await dbFirst<Enrollment>(
    db,
    'SELECT * FROM paid_enrollments WHERE payment_id = ? AND payment_method = ?',
    [paymentId, provider]
  )
}

/**
 * Create a new enrollment
 */
export const createEnrollment = async (db: D1Database, enrollment: NewEnrollment) => {
  return await dbRun(
    db,
    `INSERT INTO paid_enrollments
      (user_id, course_id, payment_id, payment_status, amount_paid, currency, payment_method, enrolled_at, expires_at, access_revoked)
     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)`,
    [
      enrollment.user_id,
      enrollment.course_id,
      enrollment.payment_id || null,
      enrollment.payment_status || 'pending',
      enrollment.amount_paid,
      enrollment.currency || 'USD',
      enrollment.payment_method || null,
      enrollment.expires_at || null,
      enrollment.access_revoked || 0
    ]
  )
}

/**
 * Get enrollments with course details for a student
 */
export const getStudentEnrollmentsWithCourse = async (db: D1Database, userId: number): Promise<any[]> => {
  return await dbAll<any>(
    db,
    `SELECT
      pe.id as enrollment_id,
      pe.enrolled_at,
      pe.completed,
      pe.completion_date,
      c.id as course_id,
      c.slug,
      c.title,
      c.subtitle,
      c.featured_image,
      c.duration_weeks,
      c.level,
      c.price
    FROM paid_enrollments pe
    JOIN courses c ON pe.course_id = c.id
    WHERE pe.user_id = ? AND pe.payment_status = 'completed' AND pe.access_revoked = 0
    ORDER BY pe.enrolled_at DESC`,
    [userId]
  )
}

/**
 * Get last accessed lesson for a student in a course
 */
export const getLastAccessedLesson = async (db: D1Database, userId: number, courseId: number): Promise<{ id: number } | null> => {
  return await dbFirst<{ id: number }>(
    db,
    `SELECT l.id
     FROM student_progress sp
     JOIN lessons l ON sp.lesson_id = l.id
     WHERE sp.user_id = ? AND sp.course_id = ? AND l.published = 1
     ORDER BY sp.updated_at DESC
     LIMIT 1`,
    [userId, courseId]
  )
}

/**
 * Get certificate by user and course
 */
export const getCertificate = async (db: D1Database, userId: number, courseId: number): Promise<Certificate | null> => {
  return await dbFirst<Certificate>(
    db,
    'SELECT * FROM certificates WHERE user_id = ? AND course_id = ?',
    [userId, courseId]
  )
}

/**
 * Get full certificate details (joined)
 */
export const getCertificateDetails = async (db: D1Database, certificateId: number, userId: number): Promise<any> => {
  return await dbFirst<any>(
    db,
    `SELECT
      c.*,
      u.name as user_name,
      u.email as user_email,
      co.title as course_title,
      co.subtitle as course_subtitle,
      co.duration_weeks,
      pe.enrolled_at,
      pe.completion_date
    FROM certificates c
    JOIN users u ON c.user_id = u.id
    JOIN courses co ON c.course_id = co.id
    JOIN paid_enrollments pe ON c.enrollment_id = pe.id
    WHERE c.id = ? AND c.user_id = ?`,
    [certificateId, userId]
  )
}

/**
 * Get certificate by code (for public verification)
 */
export const getCertificateByCode = async (db: D1Database, code: string): Promise<any> => {
  return await dbFirst<any>(
    db,
    `SELECT
      c.*,
      u.name as user_name,
      co.title as course_title,
      co.subtitle as course_subtitle,
      co.duration_weeks
    FROM certificates c
    JOIN users u ON c.user_id = u.id
    JOIN courses co ON c.course_id = co.id
    WHERE c.certificate_code = ?`,
    [code]
  )
}

/**
 * Get completed lesson IDs for a student in a course
 */
export const getCompletedLessons = async (db: D1Database, userId: number, courseId: number): Promise<number[]> => {
  const result = await dbAll<{ lesson_id: number }>(
    db,
    'SELECT lesson_id FROM student_progress WHERE user_id = ? AND course_id = ? AND completed = 1',
    [userId, courseId]
  )
  return result.map(r => r.lesson_id)
}

/**
 * Find enrollment by PayPal capture ID in metadata
 */
export const getEnrollmentByPayPalCaptureId = async (db: D1Database, captureId: string): Promise<Enrollment | null> => {
  // Escape wildcard characters % and _ and the escape character itself \
  const escapedId = captureId.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')
  return await dbFirst<Enrollment>(
    db,
    `SELECT pe.* FROM paid_enrollments pe
     JOIN payment_transactions pt ON pe.id = pt.enrollment_id
     WHERE pt.metadata LIKE ? ESCAPE '\\' AND pe.payment_method = 'paypal'
     LIMIT 1`,
    ['%' + escapedId + '%']
  )
}

/**
 * Get latest enrollment for user/course/provider
 */
export const getLatestEnrollment = async (db: D1Database, userId: number, courseId: number, provider: string): Promise<Enrollment | null> => {
  return await dbFirst<Enrollment>(
    db,
    `SELECT * FROM paid_enrollments
     WHERE user_id = ? AND course_id = ? AND payment_method = ?
     ORDER BY enrolled_at DESC LIMIT 1`,
    [userId, courseId, provider]
  )
}

/**
 * Revoke access to an enrollment
 */
export const revokeAccess = async (db: D1Database, enrollmentId: number) => {
  return await dbRun(
    db,
    'UPDATE paid_enrollments SET access_revoked = 1 WHERE id = ?',
    [enrollmentId]
  )
}

/**
 * Update enrollment status
 */
export const updateEnrollmentStatus = async (db: D1Database, paymentId: string, status: string, provider: string) => {
  return await dbRun(
    db,
    `UPDATE paid_enrollments
     SET payment_status = ?, updated_at = CURRENT_TIMESTAMP
     WHERE payment_id = ? AND payment_method = ?`,
    [status, paymentId, provider]
  )
}

/**
 * Check if user has access to a course
 */
export const userHasAccess = async (db: D1Database, userId: number, courseId: number): Promise<boolean> => {
  const result = await dbFirst<Enrollment>(
    db,
    `SELECT id FROM paid_enrollments
     WHERE user_id = ? AND course_id = ?
     AND payment_status = 'completed'
     AND access_revoked = 0`,
    [userId, courseId]
  )
  return !!result
}

/**
 * Get course progress summary
 */
export const getCourseProgress = async (db: D1Database, userId: number, courseId: number) => {
  const totalLessonsResult = await dbFirst<{ total: number }>(
    db,
    'SELECT COUNT(*) as total FROM lessons WHERE course_id = ? AND published = 1',
    [courseId]
  )

  const completedLessonsResult = await dbFirst<{ completed: number }>(
    db,
    `SELECT COUNT(*) as completed FROM student_progress
     WHERE user_id = ? AND course_id = ? AND completed = 1`,
    [userId, courseId]
  )

  const total = totalLessonsResult?.total || 0
  const completed = completedLessonsResult?.completed || 0
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return { total, completed, percentage }
}

/**
 * Get progress for a specific lesson
 */
export const getLessonProgress = async (db: D1Database, userId: number, lessonId: number): Promise<StudentProgress | null> => {
  return await dbFirst<StudentProgress>(
    db,
    'SELECT * FROM student_progress WHERE user_id = ? AND lesson_id = ?',
    [userId, lessonId]
  )
}

/**
 * Update lesson progress (upsert)
 */
export const updateLessonProgress = async (
  db: D1Database,
  userId: number,
  lessonId: number,
  courseId: number,
  data: Partial<StudentProgress>
) => {
  if (data.completed === undefined && data.notes === undefined && data.last_position === undefined) {
    throw new Error("No updatable fields provided")
  }

  const now = new Date().toISOString()

  // We use INSERT OR REPLACE or UPSERT syntax. D1 supports ON CONFLICT
  // But constructing dynamic upsert is complex.
  // Let's assume we pass all needed fields or default them, but standard use case is specific updates.
  // Actually, let's implement the specific use cases from the API.

  // Check if exists first to decide insert or update if we want more control, or use ON CONFLICT.
  // The API uses ON CONFLICT DO UPDATE SET ...

  // Implementation for completion toggle
  if (data.completed !== undefined) {
    return await dbRun(
      db,
      `INSERT INTO student_progress (user_id, lesson_id, course_id, completed, progress_percentage, completed_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, lesson_id)
       DO UPDATE SET
         completed = excluded.completed,
         progress_percentage = CASE WHEN excluded.completed = 1 THEN 100 ELSE progress_percentage END,
         completed_at = CASE WHEN excluded.completed = 1 THEN excluded.completed_at ELSE completed_at END,
         updated_at = excluded.updated_at`,
      [
        userId, lessonId, courseId,
        data.completed,
        data.completed ? 100 : 0,
        data.completed ? now : null,
        now
      ]
    )
  }

  // Implementation for notes
  if (data.notes !== undefined) {
    return await dbRun(
      db,
      `INSERT INTO student_progress (user_id, lesson_id, course_id, notes, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id, lesson_id)
       DO UPDATE SET notes = excluded.notes, updated_at = excluded.updated_at`,
      [userId, lessonId, courseId, data.notes, now]
    )
  }

  // Implementation for video position
  if (data.last_position !== undefined) {
    return await dbRun(
      db,
      `INSERT INTO student_progress (user_id, lesson_id, course_id, last_position, progress_percentage, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, lesson_id)
       DO UPDATE SET
         last_position = excluded.last_position,
         progress_percentage = CASE WHEN completed = 0 THEN excluded.progress_percentage ELSE progress_percentage END,
         updated_at = excluded.updated_at`,
      [
        userId, lessonId, courseId,
        data.last_position,
        data.progress_percentage || 0,
        now
      ]
    )
  }
}

/**
 * Generate certificate code
 */
function generateCertificateCode() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `CERT-${timestamp}-${random}`
}

/**
 * Generate/Get certificate
 */
export const generateCertificate = async (db: D1Database, userId: number, courseId: number, enrollmentId: number): Promise<number | null> => {
  // Check existing
  const existing = await dbFirst<Certificate>(
    db,
    'SELECT * FROM certificates WHERE user_id = ? AND course_id = ?',
    [userId, courseId]
  )

  if (existing) {
    return existing.id
  }

  const code = generateCertificateCode()

  const result = await dbRun(
    db,
    `INSERT INTO certificates (user_id, course_id, enrollment_id, certificate_code, issue_date, verified)
     VALUES (?, ?, ?, ?, ?, 1)`,
    [userId, courseId, enrollmentId, code, new Date().toISOString()]
  )

  return result.last_row_id as number
}

/**
 * Update enrollment completion status
 */
export const updateEnrollmentCompletion = async (db: D1Database, userId: number, courseId: number, completed: boolean) => {
  const now = new Date().toISOString()
  return await dbRun(
    db,
    `UPDATE paid_enrollments
     SET
       completed = ?,
       completion_date = ?,
       certificate_issued = ?
     WHERE user_id = ? AND course_id = ?`,
    [
      completed ? 1 : 0,
      completed ? now : null,
      completed ? 1 : 0, // Assuming certificate issued if completed
      userId, courseId
    ]
  )
}
