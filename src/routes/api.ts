import { Hono } from 'hono'
import { CloudflareBindings } from '../types'

export function registerApiRoutes(app: Hono<{ Bindings: CloudflareBindings }>) {
  const apiRoutes = new Hono<{ Bindings: CloudflareBindings }>()

  // ===== API ENDPOINTS =====

  // API: Guardar contacto en base de datos
  apiRoutes.post('/contact', async (c) => {
    try {
      const body = await c.req.parseBody()
      const { name, email, subject, message } = body

      // Validación básica
      if (!name || !email || !message) {
        return c.json({ error: 'Faltan campos requeridos' }, 400)
      }

      // Guardar en base de datos D1
      const result = await c.env.DB.prepare(`
        INSERT INTO contacts (name, email, subject, message)
        VALUES (?, ?, ?, ?)
      `).bind(name, email, subject || 'General', message).run()

      return c.json({
        success: true,
        message: 'Mensaje enviado correctamente. Te responderemos pronto.'
      })
    } catch (error) {
      console.error('Error al guardar contacto:', error)
      return c.json({ error: 'Error al enviar mensaje' }, 500)
    }
  })

  // API: Suscripción a recursos gratuitos
  apiRoutes.post('/subscribe', async (c) => {
    try {
      const body = await c.req.parseBody()
      const { name, email, resource } = body

      if (!name || !email) {
        return c.json({ error: 'Nombre y email son requeridos' }, 400)
      }

      // Intentar insertar o actualizar suscriptor
      await c.env.DB.prepare(`
        INSERT INTO subscribers (name, email, resource_requested)
        VALUES (?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET
          resource_requested = excluded.resource_requested
      `).bind(name, email, resource || 'general').run()

      // Mapa de recursos disponibles
      const resources: Record<string, string> = {
        'test-limites': '/downloads/test-limites.pdf',
        '7-senales': '/downloads/7-senales.pdf',
        'checklist-limites': '/downloads/checklist-limites.pdf',
        'audio-respiracion': '/downloads/audio-respiracion.mp3'
      }

      const downloadUrl = resource && typeof resource === 'string' ? resources[resource] : null

      return c.json({
        success: true,
        message: 'Gracias por suscribirte. Recibirás el recurso en tu email.',
        downloadUrl
      })
    } catch (error) {
      console.error('Error al guardar suscriptor:', error)
      return c.json({ error: 'Error al procesar suscripción' }, 500)
    }
  })

  // ===== AUTENTICACIÓN APIS =====

  // API: Registro de usuario
  apiRoutes.post('/register', async (c) => {
    try {
      const body = await c.req.parseBody()
      const { name, email, password, password_confirm } = body

      // Validaciones
      if (!name || !email || !password) {
        return c.json({ error: 'Todos los campos son requeridos' }, 400)
      }

      if (password !== password_confirm) {
        return c.json({ error: 'Las contraseñas no coinciden' }, 400)
      }

      if ((password as string).length < 6) {
        return c.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, 400)
      }

      // Verificar si el email ya existe
      const { getUserByEmail, createUser } = await import('../models/users')
      const existingUser = await getUserByEmail(c.env.DB, email as string)

      if (existingUser) {
        return c.json({ error: 'Este email ya está registrado' }, 400)
      }

      // Importar funciones de auth
      const { hashPassword, createSession } = await import('../auth-utils')

      // Hashear contraseña
      const passwordHash = await hashPassword(password as string)

      // Crear usuario
      const result = await createUser(c.env.DB, {
        name: name as string,
        email: email as string,
        password_hash: passwordHash,
        role: 'student',
        active: 1,
        email_verified: 0
      })

      const userId = result.last_row_id as number

      // Crear sesión
      const sessionToken = await createSession(c.env.DB, userId)

      // Establecer cookie de sesión
      c.header('Set-Cookie', `session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`)

      return c.json({
        success: true,
        message: 'Registro exitoso',
        user: {
          id: userId,
          name,
          email
        }
      })
    } catch (error) {
      console.error('Error en registro:', error)
      return c.json({ error: 'Error al crear cuenta' }, 500)
    }
  })

  // API: Login de usuario
  apiRoutes.post('/login', async (c) => {
    try {
      const body = await c.req.parseBody()
      const { email, password } = body

      if (!email || !password) {
        return c.json({ error: 'Email y contraseña requeridos' }, 400)
      }

      // Buscar usuario
      const { getUserByEmail } = await import('../models/users')
      const user = await getUserByEmail(c.env.DB, email as string)

      if (!user || !user.active) {
        return c.json({ error: 'Credenciales inválidas' }, 401)
      }

      // Verificar contraseña
      const { verifyPassword, createSession } = await import('../auth-utils')
      const isValid = await verifyPassword(password as string, user.password_hash)

      if (!isValid) {
        return c.json({ error: 'Credenciales inválidas' }, 401)
      }

      // Crear sesión
      const sessionToken = await createSession(c.env.DB, user.id as number)

      // Establecer cookie
      c.header('Set-Cookie', `session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`)

      return c.json({
        success: true,
        message: 'Login exitoso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      })
    } catch (error) {
      console.error('Error en login:', error)
      return c.json({ error: 'Error al iniciar sesión' }, 500)
    }
  })

  // API: Logout de usuario
  apiRoutes.post('/logout', async (c) => {
    try {
      // Obtener token de cookie
      const cookies = c.req.header('Cookie')
      const sessionToken = cookies?.split(';').find(c => c.trim().startsWith('session='))?.split('=')[1]

      if (sessionToken) {
        // Eliminar sesión de base de datos
        const { deleteSession } = await import('../models/users')
        await deleteSession(c.env.DB, sessionToken)
      }

      // Borrar cookie
      c.header('Set-Cookie', 'session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0')

      return c.json({ success: true, message: 'Sesión cerrada' })
    } catch (error) {
      console.error('Error en logout:', error)
      return c.json({ error: 'Error al cerrar sesión' }, 500)
    }
  })

  // API: Verificar sesión actual
  apiRoutes.get('/me', async (c) => {
    try {
      // Obtener token de cookie
      const cookies = c.req.header('Cookie')
      const sessionToken = cookies?.split(';').find(c => c.trim().startsWith('session='))?.split('=')[1]

      if (!sessionToken) {
        return c.json({ error: 'No autenticado' }, 401)
      }

      // Obtener usuario de sesión
      const { getUserFromSession } = await import('../auth-utils')
      const user = await getUserFromSession(c.env.DB, sessionToken)

      if (!user) {
        return c.json({ error: 'Sesión inválida o expirada' }, 401)
      }

      return c.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      })
    } catch (error) {
      console.error('Error verificando sesión:', error)
      return c.json({ error: 'Error al verificar sesión' }, 500)
    }
  })

  // ===== APIs DE PAGOS =====

  // API: Crear Payment Intent de Stripe
  apiRoutes.post('/create-payment-intent', async (c) => {
    try {
      const { getCurrentUser, userHasAccess } = await import('../auth-utils')
      const { getCourseById } = await import('../models/courses')
      const user = await getCurrentUser(c)

      if (!user) {
        return c.json({ error: 'No autenticado' }, 401)
      }

      const body = await c.req.json()
      const { courseId } = body

      // Obtener información del curso
      const course = await getCourseById(c.env.DB, courseId)

      if (!course || !course.published) {
        return c.json({ error: 'Curso no encontrado' }, 404)
      }

      // Verificar si ya está inscrito
      const hasAccess = await userHasAccess(c.env.DB, user.id, courseId)

      if (hasAccess) {
        return c.json({ error: 'Ya estás inscrito en este curso' }, 400)
      }

      // Crear Payment Intent con Stripe
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' as any })

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(course.price * 100), // Convertir a centavos
        currency: course.currency.toLowerCase(),
        metadata: {
          courseId: courseId.toString(),
          userId: user.id.toString(),
          courseName: course.title
        }
      })

      return c.json({
        clientSecret: paymentIntent.client_secret
      })

    } catch (error) {
      console.error('Error creando payment intent:', error)
      return c.json({ error: 'Error al procesar el pago' }, 500)
    }
  })

  // API: Verificar pago de Stripe
  apiRoutes.post('/verify-payment', async (c) => {
    try {
      const { getCurrentUser } = await import('../auth-utils')
      const { getCourseById } = await import('../models/courses')
      const { createEnrollment } = await import('../models/enrollments')
      const { recordTransaction } = await import('../models/payments')
      const user = await getCurrentUser(c)

      if (!user) {
        return c.json({ error: 'No autenticado' }, 401)
      }

      const body = await c.req.json()
      const { paymentIntentId, courseId } = body

      // Verificar el pago con Stripe
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' as any })

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

      if (paymentIntent.status !== 'succeeded') {
        return c.json({ error: 'El pago no fue exitoso' }, 400)
      }

      // Obtener información del curso
      const course = await getCourseById(c.env.DB, courseId)

      if (!course || !course.published) {
        return c.json({ error: 'Curso no encontrado' }, 404)
      }

      // Crear inscripción pagada
      const enrollmentResult = await createEnrollment(c.env.DB, {
        user_id: user.id,
        course_id: courseId,
        payment_id: paymentIntentId,
        payment_status: 'completed',
        amount_paid: course.price,
        currency: course.currency,
        payment_method: 'stripe'
      })

      // Registrar transacción
      await recordTransaction(c.env.DB, {
        user_id: user.id,
        enrollment_id: enrollmentResult.last_row_id as number,
        stripe_payment_intent_id: paymentIntentId,
        amount: course.price,
        currency: course.currency,
        status: 'succeeded',
        payment_method_type: 'card'
      })

      return c.json({
        success: true,
        message: 'Inscripción completada exitosamente'
      })

    } catch (error) {
      console.error('Error verificando pago:', error)
      return c.json({ error: 'Error al verificar el pago' }, 500)
    }
  })

  // API: Crear orden de PayPal
  apiRoutes.post('/create-paypal-order', async (c) => {
    try {
      const { getCurrentUser } = await import('../auth-utils')
      const { getCourseById } = await import('../models/courses')
      const user = await getCurrentUser(c)

      if (!user) {
        return c.json({ error: 'No autenticado' }, 401)
      }

      const body = await c.req.json()
      const { courseId } = body

      // Obtener información del curso
      const course = await getCourseById(c.env.DB, courseId)

      if (!course || !course.published) {
        return c.json({ error: 'Curso no encontrado' }, 404)
      }

      // Crear orden de PayPal usando REST API directamente
      const auth = btoa(c.env.PAYPAL_CLIENT_ID + ':' + c.env.PAYPAL_CLIENT_SECRET)
      const baseURL = c.env.PAYPAL_MODE === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com'

      const response = await fetch(baseURL + '/v2/checkout/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + auth
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: course.currency,
              value: course.price.toFixed(2)
            },
            description: course.title,
            custom_id: user.id + '-' + courseId
          }]
        })
      })

      const order = await response.json() as any

      if (!response.ok) {
        console.error('PayPal error:', order)
        return c.json({ error: 'Error al crear orden de PayPal' }, 500)
      }

      return c.json({ orderId: order.id })

    } catch (error) {
      console.error('Error creando orden PayPal:', error)
      return c.json({ error: 'Error al procesar el pago' }, 500)
    }
  })

  // API: Capturar orden de PayPal
  apiRoutes.post('/capture-paypal-order', async (c) => {
    try {
      const { getCurrentUser } = await import('../auth-utils')
      const { getCourseById } = await import('../models/courses')
      const { createEnrollment } = await import('../models/enrollments')
      const { recordTransaction } = await import('../models/payments')
      const user = await getCurrentUser(c)

      if (!user) {
        return c.json({ error: 'No autenticado' }, 401)
      }

      const body = await c.req.json()
      const { orderId, courseId } = body

      // Capturar el pago de PayPal
      const auth = btoa(c.env.PAYPAL_CLIENT_ID + ':' + c.env.PAYPAL_CLIENT_SECRET)
      const baseURL = c.env.PAYPAL_MODE === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com'

      const response = await fetch(baseURL + '/v2/checkout/orders/' + orderId + '/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + auth
        }
      })

      const capture = await response.json() as any

      if (!response.ok || capture.status !== 'COMPLETED') {
        console.error('PayPal capture error:', capture)
        return c.json({ error: 'Error al capturar el pago' }, 500)
      }

      // Obtener información del curso
      const course = await getCourseById(c.env.DB, courseId)

      if (!course || !course.published) {
        return c.json({ error: 'Curso no encontrado' }, 404)
      }

      // Crear inscripción pagada
      const enrollmentResult = await createEnrollment(c.env.DB, {
        user_id: user.id,
        course_id: courseId,
        payment_id: orderId,
        payment_status: 'completed',
        amount_paid: course.price,
        currency: course.currency,
        payment_method: 'paypal'
      })

      // Registrar transacción
      await recordTransaction(c.env.DB, {
        user_id: user.id,
        enrollment_id: enrollmentResult.last_row_id as number,
        amount: course.price,
        currency: course.currency,
        status: 'succeeded',
        payment_method_type: 'paypal',
        metadata: { orderId, captureId: capture.id }
      })

      return c.json({
        success: true,
        message: 'Inscripción completada exitosamente'
      })

    } catch (error) {
      console.error('Error capturando orden PayPal:', error)
      return c.json({ error: 'Error al procesar el pago' }, 500)
    }
  })

  // ===== HELPER DE CERTIFICADOS =====

  // Helper: Generar código único de certificado
  function generateCertificateCode() {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `CERT-${timestamp}-${random}`
  }

  // API: Generar certificado (se llama automáticamente al completar curso)
  async function generateCertificate(db: D1Database, userId: number, courseId: number, enrollmentId: number) {
    try {
      // Verificar si ya existe certificado
      const existing = await db.prepare(`
        SELECT * FROM certificates WHERE user_id = ? AND course_id = ?
      `).bind(userId, courseId).first<any>()

      if (existing) {
        return existing.id
      }

      // Generar código único
      const certificateCode = generateCertificateCode()

      // Crear certificado
      const result = await db.prepare(`
        INSERT INTO certificates (user_id, course_id, enrollment_id, certificate_code, issue_date, verified)
        VALUES (?, ?, ?, ?, ?, 1)
      `).bind(userId, courseId, enrollmentId, certificateCode, new Date().toISOString()).run()

      return result.meta.last_row_id
    } catch (error) {
      console.error('Error generando certificado:', error)
      return null
    }
  }

  // API: Marcar lección como completada
  apiRoutes.post('/lessons/:lessonId/complete', async (c) => {
    try {
      const { getCurrentUser, userHasAccess, getCourseProgress } = await import('../auth-utils')
      const { updateLessonProgress, updateEnrollmentCompletion, generateCertificate, getEnrollment } = await import('../models/enrollments')
      const user = await getCurrentUser(c)

      if (!user) {
        return c.json({ error: 'No autenticado' }, 401)
      }

      const lessonId = parseInt(c.req.param('lessonId'))
      const { completed, courseId } = await c.req.json()

      // Verificar que la lección existe y el usuario tiene acceso
      const hasAccess = await userHasAccess(c.env.DB, user.id, courseId)

      if (!hasAccess) {
        return c.json({ error: 'No tienes acceso a este curso' }, 403)
      }

      // Upsert progress
      await updateLessonProgress(c.env.DB, user.id, lessonId, courseId, {
        completed: completed ? 1 : 0
      })

      // Actualizar progreso del curso en paid_enrollments
      const progress = await getCourseProgress(c.env.DB, user.id, courseId)

      // Si completado al 100%, actualizar enrollment
      const isCompleted = progress.percentage === 100
      await updateEnrollmentCompletion(c.env.DB, user.id, courseId, isCompleted)

      // Generar certificado automáticamente si completó al 100%
      let certificateId = null
      if (isCompleted) {
        // Obtener enrollment_id
        const enrollment = await getEnrollment(c.env.DB, user.id, courseId)

        if (enrollment) {
          certificateId = await generateCertificate(c.env.DB, user.id, courseId, enrollment.id)
        }
      }

      return c.json({
        success: true,
        progress: progress.percentage,
        completed_lessons: progress.completed,
        total_lessons: progress.total,
        certificateGenerated: isCompleted,
        certificateId: certificateId
      })
    } catch (error) {
      console.error('Error al actualizar progreso:', error)
      return c.json({ error: 'Error al actualizar progreso' }, 500)
    }
  })

  // API: Guardar notas de lección
  apiRoutes.post('/lessons/:lessonId/notes', async (c) => {
    try {
      const { getCurrentUser, userHasAccess } = await import('../auth-utils')
      const { updateLessonProgress } = await import('../models/enrollments')
      const user = await getCurrentUser(c)

      if (!user) {
        return c.json({ error: 'No autenticado' }, 401)
      }

      const lessonId = parseInt(c.req.param('lessonId'))
      const { notes, courseId } = await c.req.json()

      // Verificar acceso
      const hasAccess = await userHasAccess(c.env.DB, user.id, courseId)

      if (!hasAccess) {
        return c.json({ error: 'No tienes acceso a este curso' }, 403)
      }

      // Upsert notes
      await updateLessonProgress(c.env.DB, user.id, lessonId, courseId, { notes })

      return c.json({ success: true })
    } catch (error) {
      console.error('Error al guardar notas:', error)
      return c.json({ error: 'Error al guardar notas' }, 500)
    }
  })

  // API: Actualizar posición del video
  apiRoutes.post('/lessons/:lessonId/progress', async (c) => {
    try {
      const { getCurrentUser, userHasAccess } = await import('../auth-utils')
      const { updateLessonProgress } = await import('../models/enrollments')
      const user = await getCurrentUser(c)

      if (!user) {
        return c.json({ error: 'No autenticado' }, 401)
      }

      const lessonId = parseInt(c.req.param('lessonId'))
      const { position, duration, courseId } = await c.req.json()

      // Verificar acceso
      const hasAccess = await userHasAccess(c.env.DB, user.id, courseId)

      if (!hasAccess) {
        return c.json({ error: 'No tienes acceso a este curso' }, 403)
      }

      const progressPercentage = duration > 0 ? Math.min(100, Math.round((position / duration) * 100)) : 0

      // Upsert progress
      await updateLessonProgress(c.env.DB, user.id, lessonId, courseId, {
        last_position: Math.round(position),
        progress_percentage: progressPercentage
      })

      return c.json({ success: true })
    } catch (error) {
      console.error('Error al actualizar progreso:', error)
      return c.json({ error: 'Error al actualizar progreso' }, 500)
    }
  })

  // API: Enviar respuestas del quiz
  apiRoutes.post('/quiz/submit', async (c) => {
    try {
      const { getCurrentUser, userHasAccess } = await import('../auth-utils')
      const {
        getQuiz, getQuizAttempts, getQuizQuestions, getQuizOptions,
        createQuizAttempt, createQuizAnswer
      } = await import('../models/quizzes')
      const user = await getCurrentUser(c)

      if (!user) {
        return c.json({ error: 'No autenticado' }, 401)
      }

      const { quizId, courseId, answers, timeTaken } = await c.req.json()

      // Verificar acceso
      const hasAccess = await userHasAccess(c.env.DB, user.id, courseId)
      if (!hasAccess) {
        return c.json({ error: 'No tienes acceso a este curso' }, 403)
      }

      // Obtener quiz
      const quiz = await getQuiz(c.env.DB, quizId)

      if (!quiz || quiz.course_id !== courseId) {
        return c.json({ error: 'Quiz no encontrado' }, 404)
      }

      // Verificar intentos máximos
      const attempts = await getQuizAttempts(c.env.DB, user.id, quizId)
      const attemptsCount = attempts.length

      if (quiz.max_attempts && attemptsCount >= quiz.max_attempts) {
        return c.json({ error: 'Has alcanzado el número máximo de intentos' }, 403)
      }

      // Obtener todas las preguntas con respuestas correctas
      const questions = await getQuizQuestions(c.env.DB, quizId)

      let totalPoints = 0
      let earnedPoints = 0
      const questionResults = []

      for (const question of questions) {
        totalPoints += question.points

        // Obtener respuestas correctas
        const options = await getQuizOptions(c.env.DB, question.id, false, true)
        const correctIds = new Set(options.filter(o => o.is_correct).map(o => o.id))

        const userAnswers = answers[question.id] || []
        const userAnswerSet = new Set(userAnswers)

        // Verificar si es correcta (debe seleccionar todas las correctas y ninguna incorrecta)
        const isCorrect =
          correctIds.size === userAnswerSet.size &&
          [...correctIds].every(id => userAnswerSet.has(id))

        if (isCorrect) {
          earnedPoints += question.points
        }

        questionResults.push({
          questionId: question.id,
          selectedOptions: userAnswers,
          isCorrect,
          pointsEarned: isCorrect ? question.points : 0
        })
      }

      const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
      const passed = score >= quiz.passing_score
      const now = new Date().toISOString()

      // Crear intento
      const attemptResult = await createQuizAttempt(c.env.DB, {
        quiz_id: quizId,
        user_id: user.id,
        course_id: courseId,
        score,
        points_earned: earnedPoints,
        total_points: totalPoints,
        passed: passed ? 1 : 0,
        time_taken: timeTaken,
        started_at: now,
        completed_at: now,
        answers: JSON.stringify(answers)
      })

      const attemptId = attemptResult.last_row_id as number

      // Guardar respuestas individuales
      for (const result of questionResults) {
        await createQuizAnswer(c.env.DB, {
          attempt_id: attemptId,
          question_id: result.questionId,
          selected_options: JSON.stringify(result.selectedOptions),
          is_correct: result.isCorrect ? 1 : 0,
          points_earned: result.pointsEarned
        })
      }

      return c.json({
        success: true,
        attemptId,
        score,
        passed,
        earnedPoints,
        totalPoints
      })
    } catch (error) {
      console.error('Error al enviar quiz:', error)
      return c.json({ error: 'Error al procesar la evaluación' }, 500)
    }
  })

  app.route('/api', apiRoutes)
}
