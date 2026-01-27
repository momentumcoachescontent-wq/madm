import { Hono } from 'hono'
import { html } from 'hono/html'
import { AdminLayout } from './layout'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Helper: Users List
const UsersListHelper = (users: any[]) => html`
    <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <table style="width: 100%; border-collapse: collapse;">
        <thead style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
          <tr>
            <th style="padding: 15px; text-align: left;">Nombre</th>
            <th style="padding: 15px; text-align: left;">Email</th>
            <th style="padding: 15px; text-align: left;">Rol</th>
            <th style="padding: 15px; text-align: left;">Estado</th>
            <th style="padding: 15px; text-align: right;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${users.map((user: any) => html`
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 15px;">
                <strong>${user.name}</strong>
              </td>
              <td style="padding: 15px;">${user.email}</td>
              <td style="padding: 15px;">
                <span class="badge" style="background: ${user.role === 'admin' ? '#fef3c7' : '#e2e8f0'}; color: ${user.role === 'admin' ? '#b45309' : '#475569'}; padding: 4px 8px; border-radius: 4px;">
                  ${user.role}
                </span>
              </td>
              <td style="padding: 15px;">
                ${user.active
                  ? html`<span class="badge" style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px;">Activo</span>`
                  : html`<span class="badge" style="background: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 4px;">Inactivo</span>`
                }
              </td>
              <td style="padding: 15px; text-align: right;">
                <a href="/admin/users/${user.id}" class="btn btn-sm btn-secondary">
                  <i class="fas fa-edit"></i>
                </a>
              </td>
            </tr>
          `)}
        </tbody>
      </table>
    </div>
`

// Helper: Edit User Form
const EditUserHelper = (user: any, message?: string, error?: string) => html`
  <div style="max-width: 600px; margin: 0 auto;">
    <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <h2 style="margin-top: 0; margin-bottom: 20px; color: #1e293b;">Editar Usuario: ${user.name}</h2>

      ${message ? html`<div style="background: #dcfce7; color: #166534; padding: 15px; border-radius: 6px; margin-bottom: 20px;">${message}</div>` : ''}
      ${error ? html`<div style="background: #fee2e2; color: #991b1b; padding: 15px; border-radius: 6px; margin-bottom: 20px;">${error}</div>` : ''}

      <form method="POST">
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #475569;">Nombre Completo</label>
          <input type="text" name="name" value="${user.name}" required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;">
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #475569;">Email</label>
          <input type="email" name="email" value="${user.email}" required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;">
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #475569;">Rol</label>
          <select name="role" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;">
            <option value="student" ${user.role === 'student' ? 'selected' : ''}>Estudiante</option>
            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrador</option>
          </select>
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #475569;">Estado</label>
          <select name="active" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;">
            <option value="1" ${user.active === 1 ? 'selected' : ''}>Activo</option>
            <option value="0" ${user.active === 0 ? 'selected' : ''}>Inactivo</option>
          </select>
        </div>

        <div style="margin-bottom: 30px;">
           <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #475569;">Email Verificado</label>
           <select name="email_verified" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;">
             <option value="1" ${user.email_verified === 1 ? 'selected' : ''}>Si</option>
             <option value="0" ${user.email_verified === 0 ? 'selected' : ''}>No</option>
           </select>
        </div>

        <div style="display: flex; gap: 15px;">
          <button type="submit" class="btn btn-primary btn-lg">Guardar Cambios</button>
          <a href="/admin/users" class="btn btn-secondary btn-lg">Cancelar</a>
        </div>
      </form>
    </div>
  </div>
`

app.get('/', async (c) => {
  const { listUsers } = await import('../models/users')
  const users = await listUsers(c.env.DB)

  return c.html(AdminLayout({
    title: 'Gestión de Usuarios',
    children: UsersListHelper(users),
    activeItem: 'users',
    headerActions: html`<a href="/admin" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Volver al Panel</a>`
  }))
})

app.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id)) return c.redirect('/admin/users')

  const { getUserById } = await import('../models/users')
  const user = await getUserById(c.env.DB, id)

  if (!user) return c.redirect('/admin/users')

  return c.html(AdminLayout({
    title: 'Editar Usuario',
    children: EditUserHelper(user),
    activeItem: 'users',
    headerActions: html`<a href="/admin/users" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Volver a Usuarios</a>`
  }))
})

app.post('/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id)) return c.redirect('/admin/users')

  const { getUserById, updateUser } = await import('../models/users')
  const user = await getUserById(c.env.DB, id)

  if (!user) return c.redirect('/admin/users')

  const body = await c.req.parseBody()

  // Basic Validation
  const name = body['name'] as string
  const email = body['email'] as string

  if (!name || !email) {
     return c.html(AdminLayout({
      title: 'Editar Usuario',
      children: EditUserHelper(user, undefined, 'Nombre y Email son requeridos'),
      activeItem: 'users'
    }))
  }

  try {
    await updateUser(c.env.DB, id, {
      name,
      email,
      role: body['role'] as string,
      active: parseInt(body['active'] as string, 10),
      email_verified: parseInt(body['email_verified'] as string, 10)
    })

    // Fetch updated user
    const updatedUser = await getUserById(c.env.DB, id)

    return c.html(AdminLayout({
      title: 'Editar Usuario',
      children: EditUserHelper(updatedUser, 'Usuario actualizado correctamente'),
      activeItem: 'users',
      headerActions: html`<a href="/admin/users" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Volver a Usuarios</a>`
    }))

  } catch (e) {
    return c.html(AdminLayout({
      title: 'Editar Usuario',
      children: EditUserHelper(user, undefined, 'Error al actualizar usuario: ' + (e as Error).message),
      activeItem: 'users'
    }))
  }
})

export default app
