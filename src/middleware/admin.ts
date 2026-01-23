import { Context, Next } from 'hono'
import { getCurrentUser } from '../auth-utils'

export const adminMiddleware = async (c: Context, next: Next) => {
  const user = await getCurrentUser(c)

  // Check if user is logged in and is admin
  // Note: For now, we might need to seed an admin user or manually update one in DB
  if (!user || user.role !== 'admin') {
    // If it's an API request, return JSON
    if (Boolean(c.req.path.startsWith('/api/'))) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    // Otherwise redirect to login
    return c.redirect('/login?redirect=' + encodeURIComponent(c.req.path))
  }

  // Pass user to next handlers via context variable if needed,
  // but getCurrentUser reads from session each time.
  // We could optimize by setting c.set('user', user) if Hono context is typed for it.

  await next()
}
