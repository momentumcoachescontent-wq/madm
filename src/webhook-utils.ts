// Utilidades para procesamiento de webhooks
import type { D1Database } from "@cloudflare/workers-types";

/**
 * Crear tabla de logs de webhooks si no existe
 */
export async function ensureWebhookLogTable(db: D1Database) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS webhook_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider TEXT NOT NULL,
      event_type TEXT NOT NULL,
      event_id TEXT,
      payload TEXT NOT NULL,
      status TEXT DEFAULT 'received',
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run()
}

/**
 * Registrar webhook recibido
 */
export async function logWebhook(
  db: D1Database,
  provider: 'stripe' | 'paypal',
  eventType: string,
  eventId: string | null,
  payload: unknown,
  status: 'received' | 'processed' | 'failed' = 'received',
  errorMessage?: string
) {
  await ensureWebhookLogTable(db)
  
  await db.prepare(`
    INSERT INTO webhook_logs (provider, event_type, event_id, payload, status, error_message)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    provider,
    eventType,
    eventId,
    JSON.stringify(payload),
    status,
    errorMessage ?? null
  ).run()
}

/**
 * Actualizar estado de inscripción
 */
export async function updateEnrollmentStatus(
  db: D1Database,
  paymentId: string,
  status: 'completed' | 'failed' | 'refunded',
  provider: 'stripe' | 'paypal'
) {
  const result = await db.prepare(`
    UPDATE paid_enrollments 
    SET payment_status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE payment_id = ? AND payment_method = ?
  `).bind(status, paymentId, provider).run()

  return result.meta.changes > 0
}

/**
 * Obtener inscripción por payment ID
 */
export async function getEnrollmentByPaymentId(
  db: D1Database,
  paymentId: string,
  provider: 'stripe' | 'paypal'
) {
  return await db.prepare(`
    SELECT * FROM paid_enrollments 
    WHERE payment_id = ? AND payment_method = ?
  `).bind(paymentId, provider).first()
}

/**
 * Crear inscripción desde webhook (si no existe)
 */
export async function createEnrollmentFromWebhook(
  db: D1Database,
  data: {
    userId: number
    courseId: number
    paymentId: string
    amount: number
    currency: string
    provider: 'stripe' | 'paypal'
  }
) {
  // Verificar si ya existe
  const existing = await getEnrollmentByPaymentId(db, data.paymentId, data.provider)
  if (existing) {
    return existing
  }

  // Crear nueva inscripción
  const result = await db.prepare(`
    INSERT INTO paid_enrollments 
      (user_id, course_id, payment_id, payment_status, amount_paid, currency, payment_method, enrolled_at)
    VALUES (?, ?, ?, 'completed', ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    data.userId,
    data.courseId,
    data.paymentId,
    data.amount,
    data.currency,
    data.provider
  ).run()

  return await db.prepare(`
    SELECT * FROM paid_enrollments WHERE id = ?
  `).bind(result.meta.last_row_id).first()
}

/**
 * Registrar transacción de webhook
 */
export async function logWebhookTransaction(
  db: D1Database,
  data: {
    userId: number
    enrollmentId: number | null
    paymentIntentId?: string
    amount: number
    currency: string
    status: string
    paymentMethodType: string
    metadata?: any
  }
) {
  await db.prepare(`
    INSERT INTO payment_transactions 
      (user_id, enrollment_id, stripe_payment_intent_id, amount, currency, status, payment_method_type, metadata, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    data.userId,
    data.enrollmentId,
    data.paymentIntentId || null,
    data.amount,
    data.currency,
    data.status,
    data.paymentMethodType,
    data.metadata ? JSON.stringify(data.metadata) : null
  ).run()
}

/**
 * Procesar reembolso
 */
export async function processRefund(
  db: D1Database,
  paymentId: string,
  provider: 'stripe' | 'paypal',
  refundAmount?: number,
  refundReason?: string
) {
  // Actualizar inscripción
  const updated = await updateEnrollmentStatus(db, paymentId, 'refunded', provider)
  
  if (!updated) {
    throw new Error(`No se encontró inscripción con payment_id: ${paymentId}`)
  }

  // Obtener inscripción
  const enrollment = await getEnrollmentByPaymentId(db, paymentId, provider)
  
  if (!enrollment) {
    throw new Error('Inscripción no encontrada después de actualizar')
  }

  // Registrar transacción de reembolso
  await logWebhookTransaction(db, {
    userId: enrollment.user_id as number,
    enrollmentId: enrollment.id as number,
    paymentIntentId: paymentId,
    amount: refundAmount || (enrollment.amount_paid as number),
    currency: enrollment.currency as string,
    status: 'refunded',
    paymentMethodType: provider,
    metadata: { reason: refundReason || 'refund_requested' }
  })

  // Opcional: Revocar acceso
  await db.prepare(`
    UPDATE paid_enrollments 
    SET access_revoked = 1 
    WHERE id = ?
  `).bind(enrollment.id).run()

  return enrollment
}

/**
 * Extraer metadata de curso desde Stripe payment intent
 */
export function extractCourseDataFromStripeMetadata(metadata: any): {
  userId: number
  courseId: number
} | null {
  if (!metadata || !metadata.userId || !metadata.courseId) {
    return null
  }

  return {
    userId: parseInt(metadata.userId),
    courseId: parseInt(metadata.courseId)
  }
}

/**
 * Extraer metadata de curso desde PayPal custom_id
 */
export function extractCourseDataFromPayPalCustomId(customId: string): {
  userId: number
  courseId: number
} | null {
  if (!customId) return null

  const parts = customId.split('-')
  if (parts.length !== 2) return null

  return {
    userId: parseInt(parts[0]),
    courseId: parseInt(parts[1])
  }
}

/**
 * Verificar firma de webhook de PayPal
 */
export async function verifyPayPalWebhookSignature(
  env: {
    PAYPAL_CLIENT_ID: string
    PAYPAL_CLIENT_SECRET: string
    PAYPAL_MODE: string
    PAYPAL_WEBHOOK_ID: string
  },
  headers: Headers, // Usar Headers estándar
  body: any
): Promise<boolean> {
  try {
    const baseURL = env.PAYPAL_MODE === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com'

    // 1. Obtener Access Token
    const auth = btoa(env.PAYPAL_CLIENT_ID + ':' + env.PAYPAL_CLIENT_SECRET)
    const tokenResponse = await fetch(baseURL + '/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    })

    if (!tokenResponse.ok) {
      console.error('PayPal Token Error:', await tokenResponse.text())
      return false
    }

    const tokenData = await tokenResponse.json() as any
    const accessToken = tokenData.access_token

    // 2. Preparar payload de verificación
    // Mapear headers recibidos a los nombres esperados por PayPal
    const verificationPayload = {
      auth_algo: headers.get('paypal-auth-algo'),
      cert_url: headers.get('paypal-cert-url'),
      transmission_id: headers.get('paypal-transmission-id'),
      transmission_sig: headers.get('paypal-transmission-sig'),
      transmission_time: headers.get('paypal-transmission-time'),
      webhook_id: env.PAYPAL_WEBHOOK_ID,
      webhook_event: body
    }

    // 3. Llamar API de verificación
    const verifyResponse = await fetch(baseURL + '/v1/notifications/verify-webhook-signature', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(verificationPayload)
    })

    if (!verifyResponse.ok) {
      console.error('PayPal Verify API Error:', await verifyResponse.text())
      return false
    }

    const verifyData = await verifyResponse.json() as any
    return verifyData.verification_status === 'SUCCESS'

  } catch (error) {
    console.error('Error verifying PayPal webhook:', error)
    return false
  }
}
