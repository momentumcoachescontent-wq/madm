import { Hono } from 'hono'
import { CloudflareBindings } from '../types'

export function registerWebhookRoutes(app: Hono<{ Bindings: CloudflareBindings }>) {
  const webhookRoutes = new Hono<{ Bindings: CloudflareBindings }>()

  // ===== WEBHOOKS DE PAGOS =====

  /**
   * Webhook de Stripe
   * Maneja eventos asíncronos de Stripe
   */
  webhookRoutes.post('/stripe', async (c) => {
    try {
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' as any })

      const sig = c.req.header('stripe-signature')
      if (!sig) {
        return c.json({ error: 'No signature header' }, 400)
      }

      const body = await c.req.text()

      let event: any

      try {
        // Verificar firma del webhook
        event = stripe.webhooks.constructEvent(
          body,
          sig,
          c.env.STRIPE_WEBHOOK_SECRET
        )
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message)
        return c.json({ error: 'Invalid signature' }, 400)
      }

      // Importar utilidades de webhook
      const {
        logWebhook,
        updateEnrollmentStatus,
        getEnrollmentByPaymentId,
        createEnrollmentFromWebhook,
        logWebhookTransaction,
        processRefund,
        extractCourseDataFromStripeMetadata
      } = await import('../webhook-utils')

      // Registrar webhook recibido
      await logWebhook(c.env.DB, 'stripe', event.type, event.id, event.data.object)

      console.log('Stripe webhook received:', event.type)

      // Procesar eventos según tipo
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object
          console.log('Payment succeeded:', paymentIntent.id)

          // Extraer datos del curso desde metadata
          const courseData = extractCourseDataFromStripeMetadata(paymentIntent.metadata)

          if (!courseData) {
            console.error('No course data in payment intent metadata')
            await logWebhook(c.env.DB, 'stripe', event.type, event.id, paymentIntent, 'failed', 'Missing course metadata')
            break
          }

          // Verificar si ya existe inscripción
          let enrollment = await getEnrollmentByPaymentId(c.env.DB, paymentIntent.id, 'stripe')

          if (!enrollment) {
            // Crear inscripción
            enrollment = await createEnrollmentFromWebhook(c.env.DB, {
              userId: courseData.userId,
              courseId: courseData.courseId,
              paymentId: paymentIntent.id,
              amount: paymentIntent.amount / 100, // Convertir de centavos
              currency: paymentIntent.currency.toUpperCase(),
              provider: 'stripe'
            })

            console.log('Enrollment created from webhook:', enrollment?.id)
          } else {
            // Actualizar estado si ya existe
            await updateEnrollmentStatus(c.env.DB, paymentIntent.id, 'completed', 'stripe')
            console.log('Enrollment updated:', enrollment.id)
          }

          // Registrar transacción
          await logWebhookTransaction(c.env.DB, {
            userId: courseData.userId,
            enrollmentId: enrollment?.id as number,
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency.toUpperCase(),
            status: 'succeeded',
            paymentMethodType: 'card',
            metadata: paymentIntent.metadata
          })

          // Marcar webhook como procesado
          await logWebhook(c.env.DB, 'stripe', event.type, event.id, paymentIntent, 'processed')

          break
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object
          console.log('Payment failed:', paymentIntent.id)

          // Actualizar estado de inscripción si existe
          const updated = await updateEnrollmentStatus(c.env.DB, paymentIntent.id, 'failed', 'stripe')

          if (updated) {
            console.log('Enrollment marked as failed')
          }

          // Registrar transacción fallida
          const courseData = extractCourseDataFromStripeMetadata(paymentIntent.metadata)
          if (courseData) {
            await logWebhookTransaction(c.env.DB, {
              userId: courseData.userId,
              enrollmentId: null,
              paymentIntentId: paymentIntent.id,
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency.toUpperCase(),
              status: 'failed',
              paymentMethodType: 'card',
              metadata: {
                error: paymentIntent.last_payment_error?.message || 'Payment failed'
              }
            })
          }

          await logWebhook(c.env.DB, 'stripe', event.type, event.id, paymentIntent, 'processed')

          break
        }

        case 'charge.refunded': {
          const charge = event.data.object
          console.log('Charge refunded:', charge.id)

          // Obtener payment intent ID
          const paymentIntentId = charge.payment_intent

          if (paymentIntentId) {
            try {
              // Procesar reembolso
              const enrollment = await processRefund(
                c.env.DB,
                paymentIntentId as string,
                'stripe',
                charge.amount_refunded / 100,
                'stripe_refund'
              )

              console.log('Refund processed for enrollment:', enrollment?.id)
              await logWebhook(c.env.DB, 'stripe', event.type, event.id, charge, 'processed')
            } catch (error: any) {
              console.error('Error processing refund:', error.message)
              await logWebhook(c.env.DB, 'stripe', event.type, event.id, charge, 'failed', error.message)
            }
          }

          break
        }

        case 'charge.dispute.created': {
          const dispute = event.data.object
          console.log('Dispute created:', dispute.id)

          // Marcar inscripción como en disputa (opcional)
          const paymentIntentId = dispute.payment_intent
          if (paymentIntentId) {
            await updateEnrollmentStatus(c.env.DB, paymentIntentId as string, 'disputed', 'stripe')
          }

          await logWebhook(c.env.DB, 'stripe', event.type, event.id, dispute, 'processed')

          break
        }

        default:
          console.log('Unhandled event type:', event.type)
          await logWebhook(c.env.DB, 'stripe', event.type, event.id, event.data.object, 'processed')
      }

      return c.json({ received: true })

    } catch (error: any) {
      console.error('Webhook error:', error)
      return c.json({ error: error.message }, 500)
    }
  })

  /**
   * Webhook de PayPal
   * Maneja notificaciones IPN de PayPal
   */
  webhookRoutes.post('/paypal', async (c) => {
    try {
      const body = await c.req.json()
      const webhookId = c.req.header('paypal-transmission-id')

      if (!webhookId) {
        return c.json({ error: 'No webhook ID header' }, 400)
      }

      // Importar utilidades
      const {
        logWebhook,
        updateEnrollmentStatus,
        getEnrollmentByPaymentId,
        processRefund,
        logWebhookTransaction,
        extractCourseDataFromPayPalCustomId,
        verifyPayPalWebhookSignature
      } = await import('../webhook-utils')

      const eventType = body.event_type

      // Registrar webhook recibido
      await logWebhook(c.env.DB, 'paypal', eventType, body.id || webhookId, body)

      console.log('PayPal webhook received:', eventType)

      // Verificar webhook con PayPal
      if (c.env.PAYPAL_WEBHOOK_ID) {
        const isValid = await verifyPayPalWebhookSignature(c.env, c.req.raw.headers, body)

        if (!isValid) {
          console.error('⚠️ PAYPAL WEBHOOK SIGNATURE VERIFICATION FAILED')
          // En soft-rollout continuamos, pero logueamos el error
        } else {
          console.log('✅ PayPal webhook signature verified')
        }
      } else {
        console.warn('⚠️ PAYPAL_WEBHOOK_ID not set, skipping signature verification')
      }

      // Procesar eventos según tipo
      switch (eventType) {
        case 'PAYMENT.CAPTURE.COMPLETED': {
          const resource = body.resource
          const orderId = resource.supplementary_data?.related_ids?.order_id || resource.id

          console.log('Payment capture completed:', orderId)

          // Extraer datos del curso
          const customId = resource.custom_id || resource.supplementary_data?.custom_id
          let courseData = null

          if (customId) {
            courseData = extractCourseDataFromPayPalCustomId(customId)
          }

          if (!courseData) {
            console.error('No course data in PayPal custom_id')
            await logWebhook(c.env.DB, 'paypal', eventType, body.id, resource, 'failed', 'Missing course data')
            break
          }

          // Verificar si existe inscripción
          let enrollment = await getEnrollmentByPaymentId(c.env.DB, orderId, 'paypal')

          if (!enrollment) {
            // Puede que ya se haya creado en el flujo normal, buscar por cualquier order ID relacionado
            const { getLatestEnrollment } = await import('../models/enrollments')
            enrollment = await getLatestEnrollment(c.env.DB, courseData.userId, courseData.courseId, 'paypal')
          }

          if (enrollment) {
            // Actualizar estado
            await updateEnrollmentStatus(c.env.DB, orderId, 'completed', 'paypal')
            console.log('Enrollment confirmed via webhook:', enrollment.id)
          }

          // Registrar transacción
          await logWebhookTransaction(c.env.DB, {
            userId: courseData.userId,
            enrollmentId: enrollment?.id as number || null,
            amount: parseFloat(resource.amount.value),
            currency: resource.amount.currency_code,
            status: 'succeeded',
            paymentMethodType: 'paypal',
            metadata: { orderId, captureId: resource.id }
          })

          await logWebhook(c.env.DB, 'paypal', eventType, body.id, resource, 'processed')

          break
        }

        case 'PAYMENT.CAPTURE.REFUNDED': {
          const resource = body.resource
          const captureId = resource.id

          console.log('Payment refunded:', captureId)

          // Buscar inscripción por metadata
          const { getEnrollmentByPayPalCaptureId } = await import('../models/enrollments')
          const enrollment = await getEnrollmentByPayPalCaptureId(c.env.DB, captureId)

          if (enrollment) {
            try {
              await processRefund(
                c.env.DB,
                enrollment.payment_id as string,
                'paypal',
                parseFloat(resource.amount.value),
                'paypal_refund'
              )

              console.log('Refund processed for enrollment:', enrollment.id)
              await logWebhook(c.env.DB, 'paypal', eventType, body.id, resource, 'processed')
            } catch (error: any) {
              console.error('Error processing refund:', error.message)
              await logWebhook(c.env.DB, 'paypal', eventType, body.id, resource, 'failed', error.message)
            }
          }

          break
        }

        case 'PAYMENT.CAPTURE.DENIED':
        case 'PAYMENT.CAPTURE.DECLINED': {
          const resource = body.resource
          console.log('Payment denied/declined:', resource.id)

          await logWebhook(c.env.DB, 'paypal', eventType, body.id, resource, 'processed')

          break
        }

        default:
          console.log('Unhandled PayPal event:', eventType)
          await logWebhook(c.env.DB, 'paypal', eventType, body.id || webhookId, body, 'processed')
      }

      return c.json({ received: true })

    } catch (error: any) {
      console.error('PayPal webhook error:', error)
      return c.json({ error: error.message }, 500)
    }
  })

  app.route('/api/webhooks', webhookRoutes)
}
