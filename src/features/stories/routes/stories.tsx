import { Hono } from 'hono'
import { CloudflareBindings } from '../../../types'
import { ShareStoryPage } from '../views/ShareStoryPage'
import { createStory } from '../models/stories'
import { getCurrentUser } from '../../../auth-utils'
import { HeroSection } from '../../../views/components/HeroSection'
import { Button } from '../../../views/components/Button'

function extractMeta(html: string, targetName: string): string | null {
  const metaTags = html.match(/<meta\s+[^>]*>/gi) || []
  for (const tag of metaTags) {
    const nameMatch = tag.match(/name=(?:"([^"]*)"|'([^']*)')/i)
    const name = nameMatch ? (nameMatch[1] || nameMatch[2]) : null

    if (name === targetName) {
      const contentMatch = tag.match(/content=(?:"([^"]*)"|'([^']*)')/i)
      return contentMatch ? (contentMatch[1] || contentMatch[2]) : null
    }
  }
  return null
}

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

      // Check Size
      let maxBytes = 3 * 1024 * 1024 // Default 3MB
      if (c.env.MAX_UPLOAD_BYTES) {
        const parsed = parseInt(c.env.MAX_UPLOAD_BYTES)
        if (!Number.isNaN(parsed) && parsed > 0) {
          maxBytes = parsed
        }
      }

      if (file.size > maxBytes) {
        return c.text('File too large', 413)
      }

      // Read content for metadata extraction
      const content = await file.text()

      // Validate Metadata
      const meta_title = extractMeta(content, 'madm:title')
      const meta_author = extractMeta(content, 'madm:author')
      const hasStorySection = /<section\s+[^>]*data-madm=["']story["'][^>]*>/i.test(content)

      if (!meta_title || !meta_author || !hasStorySection) {
        return c.text('Invalid file format. Missing required metadata or sections.', 400)
      }

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
      let ipAddress: string | null = c.req.header('CF-Connecting-IP') ?? 'unknown'
      if (ipAddress === 'unknown' && c.req.header('host')?.includes('localhost')) {
        ipAddress = '127.0.0.1'
      }

      const storeIp = c.env.STORE_CLIENT_IP === 'true'
      if (!storeIp) {
        ipAddress = null
      }

      // Create DB Record
      try {
        await createStory(c.env.DB, {
          user_id: userId,
          r2_key: r2Key,
          original_filename: file.name,
          meta_title,
          meta_author,
          ip_address: ipAddress
        })
      } catch (e) {
        // Cleanup R2
        await c.env.IMAGES_BUCKET.delete(r2Key)
        throw e
      }

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
