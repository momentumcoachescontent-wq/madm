import { Hono } from 'hono'
import { CloudflareBindings } from '../../../types'
import { ShareStoryPage } from '../views/ShareStoryPage'

export function registerStoriesRoutes(app: Hono<{ Bindings: CloudflareBindings }>) {
  const storiesRoutes = new Hono<{ Bindings: CloudflareBindings }>()

  // GET /comparte-tu-historia
  storiesRoutes.get('/', (c) => {
    return c.render(<ShareStoryPage />)
  })

  app.route('/comparte-tu-historia', storiesRoutes)
}
