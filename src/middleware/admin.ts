import { Context, Next } from 'hono'
import { getCurrentUser } from '../auth-utils'

export const adminMiddleware = async (c: Context, next: Next) => {
  const user = await getCurrentUser(c)

  // Check if user is logged in and is admin
  // Note: For now, we might need to seed an admin user or manually update one in DB
  if (!user) {
  return c.redirect('/login?redirect=' + encodeURIComponent(c.req.path))
}
if (user.role !== 'admin') {
  return c.text('Forbidden: admin role required', 403)
}


  // Pass user to next handlers via context variable if needed,
  // but getCurrentUser reads from session each time.
  // We could optimize by setting c.set('user', user) if Hono context is typed for it.

  await next()
}
