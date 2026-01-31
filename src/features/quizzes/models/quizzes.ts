import { dbFirst, dbAll, dbRun } from '../../../models/db'

export interface Quiz {
  id: number
  course_id: number
  title: string
  description: string | null
  time_limit: number | null
  passing_score: number
  max_attempts: number | null
  randomize_questions: number // 0 or 1
  randomize_options: number // 0 or 1
  show_correct_answers: number // 0 or 1
  published: number // 0 or 1
  created_at: string
  updated_at: string
}

export interface QuizQuestion {
  id: number
  quiz_id: number
  question_text: string
  question_type: 'single_choice' | 'multiple_select' | 'true_false'
  points: number
  explanation: string | null
  order_index: number
}

export interface QuizOption {
  id: number
  question_id: number
  option_text: string
  is_correct: number // 0 or 1
  order_index: number
}

export type QuizOptionWithoutCorrect = Omit<QuizOption, 'is_correct'>

export interface QuizAttempt {
  id: number
  quiz_id: number
  user_id: number
  course_id: number
  score: number
  points_earned: number
  total_points: number
  passed: number // 0 or 1
  time_taken: number
  started_at: string
  completed_at: string
  answers: string // JSON
}

export interface QuizAnswer {
  id: number
  attempt_id: number
  question_id: number
  selected_options: string // JSON
  is_correct: number // 0 or 1
  points_earned: number
}

/**
 * Get a quiz by ID
 */
export const getQuiz = async (db: D1Database, id: number): Promise<Quiz | null> => {
  return dbFirst<Quiz>(db, 'SELECT * FROM quizzes WHERE id = ?', [id])
}

/**
 * Get quiz questions
 */
export const getQuizQuestions = async (db: D1Database, quizId: number, randomize: boolean = false): Promise<QuizQuestion[]> => {
  const orderBy = randomize ? 'RANDOM()' : 'order_index ASC'
  return dbAll<QuizQuestion>(
    db,
    `SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY ${orderBy}`,
    [quizId]
  )
}

/**
 * Get options for a question
 */
export async function getQuizOptions(db: D1Database, questionId: number, randomize: boolean, includeCorrect: false): Promise<QuizOptionWithoutCorrect[]>
export async function getQuizOptions(db: D1Database, questionId: number, randomize?: boolean, includeCorrect?: true): Promise<QuizOption[]>
export async function getQuizOptions(db: D1Database, questionId: number, randomize: boolean = false, includeCorrect: boolean = true): Promise<QuizOption[] | QuizOptionWithoutCorrect[]> {
  let query = 'SELECT id, question_id, option_text, order_index'
  if (includeCorrect) {
    query += ', is_correct'
  }
  query += ` FROM quiz_options WHERE question_id = ? ORDER BY ${randomize ? 'RANDOM()' : 'order_index ASC'}`

  if (includeCorrect) {
    return dbAll<QuizOption>(db, query, [questionId])
  } else {
    return dbAll<QuizOptionWithoutCorrect>(db, query, [questionId])
  }
}

/**
 * Get quiz attempts for a user
 */
export const getQuizAttempts = async (db: D1Database, userId: number, quizId: number): Promise<QuizAttempt[]> => {
  return dbAll<QuizAttempt>(
    db,
    'SELECT * FROM quiz_attempts WHERE quiz_id = ? AND user_id = ? ORDER BY started_at DESC',
    [quizId, userId]
  )
}

/**
 * Get a specific quiz attempt
 */
export const getQuizAttempt = async (db: D1Database, attemptId: number, userId: number): Promise<QuizAttempt | null> => {
  return dbFirst<QuizAttempt>(
    db,
    'SELECT * FROM quiz_attempts WHERE id = ? AND user_id = ?',
    [attemptId, userId]
  )
}

/**
 * Create a quiz attempt
 */
export const createQuizAttempt = async (db: D1Database, attempt: Partial<QuizAttempt>) => {
  return dbRun(
    db,
    `INSERT INTO quiz_attempts (
      quiz_id, user_id, course_id, score, points_earned,
      total_points, passed, time_taken, started_at, completed_at, answers
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      attempt.quiz_id,
      attempt.user_id,
      attempt.course_id,
      attempt.score,
      attempt.points_earned,
      attempt.total_points,
      attempt.passed,
      attempt.time_taken,
      attempt.started_at,
      attempt.completed_at,
      attempt.answers
    ]
  )
}

/**
 * Create a quiz answer record
 */
export const createQuizAnswer = async (db: D1Database, answer: Partial<QuizAnswer>) => {
  return dbRun(
    db,
    `INSERT INTO quiz_answers (
      attempt_id, question_id, selected_options, is_correct, points_earned
    )
    VALUES (?, ?, ?, ?, ?)`,
    [
      answer.attempt_id,
      answer.question_id,
      answer.selected_options,
      answer.is_correct,
      answer.points_earned
    ]
  )
}

/**
 * Get detailed answers for an attempt (Joined with questions)
 */
export const getQuizAnswersDetailed = async (db: D1Database, attemptId: number): Promise<any[]> => {
  return dbAll<any>(
    db,
    `SELECT
      qa.*,
      qq.question_text,
      qq.question_type,
      qq.explanation,
      qq.points
    FROM quiz_answers qa
    JOIN quiz_questions qq ON qa.question_id = qq.id
    WHERE qa.attempt_id = ?
    ORDER BY qq.order_index ASC`,
    [attemptId]
  )
}
