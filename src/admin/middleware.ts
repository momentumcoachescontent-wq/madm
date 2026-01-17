import { Context, Next } from 'hono'
import { getUserFromSession } from '../auth-utils'

export async function adminMiddleware(c: Context, next: Next) {
  const cookies = c.req.header('Cookie')
  if (!cookies) {
    return c.redirect('/login?redirect=' + encodeURIComponent(c.req.path))
  }

  const sessionToken = cookies.split(';').find(c => c.trim().startsWith('session='))?.split('=')[1]
  if (!sessionToken) {
    return c.redirect('/login?redirect=' + encodeURIComponent(c.req.path))
  }

  const user = await getUserFromSession(c.env.DB, sessionToken)

  if (!user) {
    return c.redirect('/login?redirect=' + encodeURIComponent(c.req.path))
  }

  if (user.role !== 'admin') {
    return c.text('Acceso Denegado: Se requiere rol de administrador', 403)
  }

  // Inject user into context for later use
  c.set('user', user)

  await next()
}
