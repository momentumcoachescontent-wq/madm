import { Hono } from 'hono'
import { CloudflareBindings } from '../types'
import { getCurrentUser } from '../auth-utils'
import { HeroSection } from '../views/components/HeroSection'
import { Card } from '../views/components/Card'
import { Button } from '../views/components/Button'

export function registerAiRoutes(app: Hono<{ Bindings: CloudflareBindings }>) {
  const aiRoutes = new Hono<{ Bindings: CloudflareBindings }>()

  aiRoutes.get('/asistente-ia', async (c) => {
    try {
      // 1. Identificar Usuario
      const user = await getCurrentUser(c)
      let userId: number | null = null
      let ipAddress = c.req.header('CF-Connecting-IP') || 'unknown'

      // Si estamos en desarrollo local, IP puede ser localhost
      if (ipAddress === 'unknown' && c.req.header('host')?.includes('localhost')) {
        ipAddress = '127.0.0.1'
      }

      // 2. Determinar Tipo de Usuario y Límite
      let limit = 1 // Por defecto (Anónimo)
      let userType = 'anonymous'

      if (user) {
        userId = user.id
        userType = 'free'
        limit = 3

        // Verificar si tiene cursos comprados (Paid)
        // Check for ANY active paid enrollment
        const paidEnrollment = await c.env.DB.prepare(
          `SELECT 1 FROM paid_enrollments
           WHERE user_id = ?
           AND payment_status = 'completed'
           AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
           AND access_revoked = 0
           LIMIT 1`
        ).bind(userId).first()

        if (paidEnrollment) {
          userType = 'paid'
          limit = 10
        }
      }

      // 3. Consultar Uso Diario
      const today = new Date().toISOString().split('T')[0]

      let usageQuery = ''
      let usageParams: any[] = []

      if (userId) {
        usageQuery = `SELECT * FROM daily_ai_usage WHERE user_id = ? AND usage_date = ?`
        usageParams = [userId, today]
      } else {
        usageQuery = `SELECT * FROM daily_ai_usage WHERE user_id IS NULL AND ip_address = ? AND usage_date = ?`
        usageParams = [ipAddress, today]
      }

      const usageRecord = await c.env.DB.prepare(usageQuery).bind(...usageParams).first<{ id: number, count: number }>()
      const currentCount = usageRecord ? usageRecord.count : 0

      // 4. Verificar Límite
      if (currentCount >= limit) {
        return c.render(
          <AiLimitReachedPage userType={userType} limit={limit} />
        )
      }

      // 5. Registrar Uso
      if (usageRecord) {
        await c.env.DB.prepare(
          `UPDATE daily_ai_usage SET count = count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
        ).bind(usageRecord.id).run()
      } else {
        await c.env.DB.prepare(
          `INSERT INTO daily_ai_usage (user_id, ip_address, usage_date, count) VALUES (?, ?, ?, 1)`
        ).bind(userId, ipAddress, today).run()
      }

      // 6. Redirigir a la Herramienta
      return c.redirect('https://opal.google/?flow=drive:/1ksajqIwfHXZb3FLtvzuC8ddkx4uZgE9_&shared&mode=app')

    } catch (error) {
      console.error('Error en ruta de IA:', error)
      return c.text('Error interno del servidor', 500)
    }
  })

  app.route('/', aiRoutes)
}

function AiLimitReachedPage({ userType, limit }: { userType: string, limit: number }) {
  return (
    <div>
      <HeroSection
        title="Límite Diario Alcanzado"
        subtitle="Has utilizado todas tus consultas gratuitas por hoy"
        variant="small"
      />

      <section className="section">
        <div className="container" style="max-width: 800px; text-align: center;">
          <div className="limit-icon" style="margin-bottom: 30px;">
            <i className="fas fa-hourglass-end fa-5x" style="color: #f59e0b;"></i>
          </div>

          <h2>Has realizado {limit} de {limit} consultas permitidas hoy</h2>

          <p className="lead" style="margin: 30px 0;">
            Nuestra herramienta de IA tiene costos operativos, por lo que limitamos el uso diario
            para garantizar que todos puedan acceder a ella.
          </p>

          <div className="card-grid" style="display: grid; gap: 30px; margin-top: 50px;">
            {/* Opciones según tipo de usuario */}
            {userType === 'anonymous' && (
              <Card title="Regístrate Gratis" icon="fas fa-user-plus" className="card bg-light">
                <p>Crea una cuenta gratuita para obtener <strong>3 consultas diarias</strong> en lugar de 1.</p>
                <div style="margin-top: 20px;">
                  <Button href="/registro" variant="primary">Crear Cuenta</Button>
                </div>
              </Card>
            )}

            {(userType === 'anonymous' || userType === 'free') && (
              <Card title="Acceso Premium" icon="fas fa-crown" className="card bg-light" iconClass="text-warning">
                <p>
                  Adquiere cualquiera de nuestros cursos y obtén <strong>10 consultas diarias</strong>,
                  además de acceso de por vida al contenido.
                </p>
                <div style="margin-top: 20px;">
                  <Button href="/cursos" variant="secondary">Ver Cursos</Button>
                </div>
              </Card>
            )}

            {userType === 'paid' && (
              <div style="background: #f8fafc; padding: 30px; border-radius: 12px;">
                <h3><i className="fas fa-star text-warning"></i> Eres un usuario Premium</h3>
                <p>
                  Gracias por ser parte de nuestra comunidad. Tu límite de 10 consultas se reiniciará mañana.
                </p>
                <div style="margin-top: 20px;">
                  <Button href="/" variant="primary">Volver al Inicio</Button>
                </div>
              </div>
            )}
          </div>

          <div style="margin-top: 50px;">
            <p className="text-muted">El límite se reinicia cada día a medianoche (UTC).</p>
          </div>
        </div>
      </section>
    </div>
  )
}
