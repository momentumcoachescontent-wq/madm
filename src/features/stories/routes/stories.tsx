import { Hono } from 'hono'
import { CloudflareBindings } from '../../../types'
import { ShareStoryPage } from '../views/ShareStoryPage'
import { StoriesListPage } from '../views/StoriesListPage'
import { StoryDetailPage } from '../views/StoryDetailPage'
import {
  createStory,
  listPublicStories,
  getPublicStoryBySlug,
  incrementStoryView,
  incrementStoryLike
} from '../models/stories'
import { getCurrentUser } from '../../../auth-utils'
import { HeroSection } from '../../../views/components/HeroSection'
import { Button } from '../../../views/components/Button'

function extractMeta(html: string, targetName: string): string | null {
  const metaTags = html.match(/<meta\s+[^>]*>/gi) || []
  for (const tag of metaTags) {
    const nameMatch = tag.match(/name\s*=\s*(?:"([^"]*)"|'([^']*)')/i)
    const name = nameMatch ? (nameMatch[1] || nameMatch[2]) : null

    if (name === targetName) {
      const contentMatch = tag.match(/content\s*=\s*(?:"([^"]*)"|'([^']*)')/i)
      return contentMatch ? (contentMatch[1] || contentMatch[2]) : null
    }
  }
  return null
}

export function registerStoriesRoutes(app: Hono<{ Bindings: CloudflareBindings }>) {
  // Submission Routes
  const submissionRoutes = new Hono<{ Bindings: CloudflareBindings }>()

  // GET /comparte-tu-historia
  submissionRoutes.get('/', async (c) => {
    // Fetch recent public stories to display at the top
    const stories = await listPublicStories(c.env.DB, { limit: 3 })
    return c.render(<ShareStoryPage stories={stories} />)
  })

  // POST /comparte-tu-historia
  submissionRoutes.post('/', async (c) => {
    try {
      const body = await c.req.parseBody()
      const storyTextRaw = body['story_text']
      let storyText = ''

      if (typeof storyTextRaw === 'string') {
        storyText = storyTextRaw.trim()
      }

      if (!storyText) {
        return c.render(
          <div>
            <HeroSection title="Error" subtitle="Por favor revisa tu envío." variant="small" />
            <section className="section">
              <div className="container" style={{ textAlign: 'center' }}>
                <p className="text-red-500">Por favor, escribe tu historia.</p>
                <Button href="/comparte-tu-historia" variant="primary">Volver a intentar</Button>
              </div>
            </section>
          </div>
        )
      }

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
      await createStory(c.env.DB, {
        user_id: userId,
        r2_key: 'text-submission',
        original_filename: 'text-submission.txt',
        meta_title: 'Historia compartida',
        meta_author: 'Anónimo',
        ip_address: ipAddress,
        story_text: storyText
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

  app.route('/comparte-tu-historia', submissionRoutes)

  // Public Stories Routes
  const publicStoriesRoutes = new Hono<{ Bindings: CloudflareBindings }>()

  // GET /historias - List
  publicStoriesRoutes.get('/', async (c) => {
    let page = parseInt(c.req.query('page') || '1')
    if (Number.isNaN(page) || page < 1) {
      page = 1
    }
    const tag = c.req.query('tag')
    const limit = 9
    const offset = (page - 1) * limit

    const stories = await listPublicStories(c.env.DB, {
      limit: limit + 1, // Fetch one more to check if there are more
      offset,
      tag
    })

    const hasMore = stories.length > limit
    const displayStories = hasMore ? stories.slice(0, limit) : stories

    return c.render(
      <StoriesListPage
        stories={displayStories}
        page={page}
        hasMore={hasMore}
        tag={tag}
      />
    )
  })

  // GET /historias/:slug - Detail
  publicStoriesRoutes.get('/:slug', async (c) => {
    const slug = c.req.param('slug')
    const story = await getPublicStoryBySlug(c.env.DB, slug)

    if (!story) {
      return c.notFound()
    }

    // Increment View (Async, don't await strictly if performance matters,
    // but typically safe to await for simple analytics)
    await incrementStoryView(c.env.DB, story.id)
    // Update local count to reflect immediately
    story.views = (story.views || 0) + 1

    return c.render(<StoryDetailPage story={story} />)
  })

  // POST /historias/:slug/like - Like
  publicStoriesRoutes.post('/:slug/like', async (c) => {
    const slug = c.req.param('slug')
    const story = await getPublicStoryBySlug(c.env.DB, slug)

    if (story) {
      await incrementStoryLike(c.env.DB, story.id)
    }

    // Redirect back to the story page
    return c.redirect(`/historias/${slug}`)
  })

  app.route('/historias', publicStoriesRoutes)
}
