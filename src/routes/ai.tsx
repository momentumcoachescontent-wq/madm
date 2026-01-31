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
      // 0. Verificar conexión a DB
      if (!c.env.DB) {
        throw new Error('Database binding (DB) is missing. Check wrangler.toml or Cloudflare Pages settings.')
      }

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

      // 3. Verificación de Límite y Registro de Uso
      // Nota: Usamos una estrategia manual (SELECT -> UPDATE/INSERT) en lugar de ON CONFLICT
      // para evitar errores si los índices parciales faltan en producción.
      const today = new Date().toISOString().split('T')[0]
      let allowAccess = false

      // Buscar registro existente
      let usageRecord
      if (userId) {
        usageRecord = await c.env.DB.prepare(
          `SELECT id, count FROM daily_ai_usage WHERE user_id = ? AND usage_date = ?`
        ).bind(userId, today).first()
      } else {
        usageRecord = await c.env.DB.prepare(
          `SELECT id, count FROM daily_ai_usage WHERE user_id IS NULL AND ip_address = ? AND usage_date = ?`
        ).bind(ipAddress, today).first()
      }

      if (usageRecord) {
        // Registro existe, verificar límite de forma atómica
        const updateResult = await c.env.DB.prepare(
          `UPDATE daily_ai_usage SET count = count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND count < ?`
        ).bind(usageRecord.id, limit).run()

        if (updateResult.meta.changes > 0) {
          allowAccess = true
        } else {
          // Límite alcanzado
          allowAccess = false
        }
      } else {
        // Registro no existe, insertar (inicio de conteo)
        try {
          await c.env.DB.prepare(
            `INSERT INTO daily_ai_usage (user_id, ip_address, usage_date, count) VALUES (?, ?, ?, 1)`
          ).bind(userId || null, ipAddress, today).run()
          allowAccess = true
        } catch (err: any) {
          // Si falla por UNIQUE constraint (race condition), intentamos actualizar
          // Esto maneja el caso donde otro request creó el registro milisegundos antes
          if (err.message && (err.message.includes('UNIQUE') || err.message.includes('constraint'))) {
             // Reintentar lógica de actualización (simplificada: asumimos que si falla insert es porque existe)
             // Intentamos update ciego
             const updateQuery = userId
               ? `UPDATE daily_ai_usage SET count = count + 1, updated_at = CURRENT_TIMESTAMP WHERE usage_date = ? AND count < ? AND user_id = ?`
               : `UPDATE daily_ai_usage SET count = count + 1, updated_at = CURRENT_TIMESTAMP WHERE usage_date = ? AND count < ? AND user_id IS NULL AND ip_address = ?`

             const updateArgs = userId ? [today, limit, userId] : [today, limit, ipAddress]

             const updateResult = await c.env.DB.prepare(updateQuery).bind(...updateArgs).run()

             if (updateResult.meta.changes && updateResult.meta.changes > 0) {
               allowAccess = true
             }
          } else {
            throw err
          }
        }
      }

      if (allowAccess) {
        return c.redirect('https://opal.google/app/1ksajqIwfHXZb3FLtvzuC8ddkx4uZgE9_?shared')
      } else {
        return c.render(
          <AiLimitReachedPage userType={userType} limit={limit} />
        )
      }

    } catch (error: any) {
      console.error('Error en ruta de IA:', error)

      // Improve error message for known DB issues (likely missing migrations in production)
      if (error.message && error.message.includes('no such table')) {
        return c.text('Error de configuración: La tabla requerida no existe. Por favor, ejecuta las migraciones de base de datos (Error: no such table).', 500)
      }

      return c.text(`Error interno del servidor: ${error instanceof Error ? error.message : String(error)}`, 500)
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
