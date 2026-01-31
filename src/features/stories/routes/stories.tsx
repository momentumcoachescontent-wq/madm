import { Hono } from 'hono'
import { CloudflareBindings } from '../../../types'
import { ShareStoryPage } from '../views/ShareStoryPage'
import { createStory } from '../models/stories'
import { getCurrentUser } from '../../../auth-utils'
import { HeroSection } from '../../../views/components/HeroSection'
import { Button } from '../../../views/components/Button'

export function registerStoriesRoutes(app: Hono<{ Bindings: CloudflareBindings }>) {
  const storiesRoutes = new Hono<{ Bindings: CloudflareBindings }>()

  // GET /comparte-tu-historia
  storiesRoutes.get('/', (c) => {
    return c.render(<ShareStoryPage />)
  })

  // POST /comparte-tu-historia
  storiesRoutes.post('/', async (c) => {
    try {
      const body = await c.req.parseBody()
      const file = body['file']

      if (!file || !(file instanceof File)) {
        return c.text('No file uploaded', 400)
      }

      // Basic Validation (Double check server side)
      if (!file.name.endsWith('.html') && file.type !== 'text/html') {
        return c.text('Invalid file type. Only .html is allowed.', 400)
      }

      // Read content for metadata extraction
      const content = await file.text()

      // Extract Metadata using Regex
      const titleMatch = content.match(/<meta\s+name="madm:title"\s+content="([^"]*)"/i)
      const authorMatch = content.match(/<meta\s+name="madm:author"\s+content="([^"]*)"/i)

      const meta_title = titleMatch ? titleMatch[1] : null
      const meta_author = authorMatch ? authorMatch[1] : null

      // Upload to R2
      const timestamp = Date.now()
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const r2Key = `stories/${timestamp}-${sanitizedFilename}`

      await c.env.IMAGES_BUCKET.put(r2Key, content, {
        httpMetadata: {
          contentType: 'text/html',
        },
      })

      // Get User (if logged in)
      const user = await getCurrentUser(c)
      const userId = user ? user.id : null

      // Get IP
      let ipAddress = c.req.header('CF-Connecting-IP') ?? 'unknown'
      if (ipAddress === 'unknown' && c.req.header('host')?.includes('localhost')) {
        ipAddress = '127.0.0.1'
      }

      // Create DB Record
      await createStory(c.env.DB, {
        user_id: userId,
        r2_key: r2Key,
        original_filename: file.name,
        meta_title,
        meta_author,
        ip_address: ipAddress
      })

      // Return Success View
      return c.render(
        <div>
           <HeroSection
            title="¡Historia Enviada!"
            subtitle="Gracias por compartir tu experiencia con la comunidad."
            variant="small"
           />
           <section className="section">
             <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
               <div style={{ color: '#10b981', marginBottom: '30px' }}>
                 <i className="fas fa-check-circle fa-5x"></i>
               </div>
               <h2>Hemos recibido tu historia</h2>
               <p className="lead" style={{ marginBottom: '30px' }}>
                 Tu historia ha sido enviada correctamente. Nuestro equipo la revisará para asegurar
                 que cumple con las normas de la comunidad antes de ser publicada.
               </p>
               <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '40px' }}>
                 <p style={{ margin: 0, color: '#64748b' }}>
                   <strong>ID de Envío:</strong> {r2Key.split('/')[1]}<br/>
                   <strong>Estado:</strong> <span className="badge badge-warning" style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9em' }}>Pendiente de moderación</span>
                 </p>
               </div>
               <Button href="/" variant="primary">Volver al Inicio</Button>
             </div>
           </section>
        </div>
      )

    } catch (error) {
      console.error('Error submitting story:', error)
      return c.text('Error interno del servidor al procesar tu historia.', 500)
    }
  })

  app.route('/comparte-tu-historia', storiesRoutes)
}
