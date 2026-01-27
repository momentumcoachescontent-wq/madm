import { dbFirst, dbAll, dbRun } from './db'

export interface PaymentTransaction {
  id: number
  user_id: number
  enrollment_id: number | null
  stripe_payment_intent_id: string | null
  amount: number
  currency: string
  status: 'pending' | 'succeeded' | 'failed' | 'refunded'
  payment_method_type: string | null
  metadata: string | null
  created_at: string
}

export type NewPaymentTransaction = {
  user_id: number
  enrollment_id: number | null
  stripe_payment_intent_id?: string | null
  amount: number
  currency: string
  status: string
  payment_method_type: string
  metadata?: any
}

/**
 * Record a payment transaction
 */
export const recordTransaction = async (db: D1Database, transaction: NewPaymentTransaction) => {
  return await dbRun(
    db,
    `INSERT INTO payment_transactions
      (user_id, enrollment_id, stripe_payment_intent_id, amount, currency, status, payment_method_type, metadata, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      transaction.user_id,
      transaction.enrollment_id,
      transaction.stripe_payment_intent_id || null,
      transaction.amount,
      transaction.currency,
      transaction.status,
      transaction.payment_method_type,
      transaction.metadata ? JSON.stringify(transaction.metadata) : null
    ]
  )
}

/**
 * Get transactions for a user
 */
export const getUserTransactions = async (db: D1Database, userId: number): Promise<PaymentTransaction[]> => {
  return await dbAll<PaymentTransaction>(
    db,
    'SELECT * FROM payment_transactions WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  )
}
