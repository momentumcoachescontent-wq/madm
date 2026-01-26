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
                <button class="btn btn-sm btn-secondary" onclick="alert('Edición no implementada aún')">
                  <i class="fas fa-edit"></i>
                </button>
              </td>
            </tr>
          `)}
        </tbody>
      </table>
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

export default app
