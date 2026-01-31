import { Hono } from 'hono'
import { html } from 'hono/html'
import { CloudflareBindings } from '../../../types'
import { AdminLayout } from '../../../admin/layout'
import { listStories, updateStoryStatus, countStories } from '../models/stories'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// Helper: Status Badge
const StatusBadge = (status: string) => {
  let color = 'gray'
  let label = status
  if (status === 'approved') {
    color = 'green'
    label = 'Aprobado'
  } else if (status === 'rejected') {
    color = 'red'
    label = 'Rechazado'
  } else if (status === 'pending') {
    color = 'yellow'
    label = 'Pendiente'
  }

  const styles = {
    green: 'background: #dcfce7; color: #15803d;',
    red: 'background: #fee2e2; color: #b91c1c;',
    yellow: 'background: #fef3c7; color: #b45309;',
    gray: 'background: #f1f5f9; color: #475569;'
  }

  return html`<span style="padding: 4px 10px; border-radius: 999px; font-size: 0.8em; font-weight: 600; ${styles[color as keyof typeof styles]}">${label}</span>`
}

// LIST Stories
app.get('/', async (c) => {
  let page = parseInt(c.req.query('page') || '1')
  if (Number.isNaN(page) || page < 1) {
    page = 1
  }
  const status = c.req.query('status')
  const limit = 20
  const offset = (page - 1) * limit

  const stories = await listStories(c.env.DB, { status, limit, offset })
  const total = await countStories(c.env.DB, { status })
  const totalPages = Math.ceil(total / limit)

  return c.html(AdminLayout({
    title: 'Historias de Usuarios',
    activeItem: 'stories',
    children: html`
      <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden;">

        <!-- Toolbar -->
        <div style="padding: 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; gap: 10px;">
            <a href="/admin/stories" class="btn btn-sm ${!status ? 'btn-primary' : 'btn-secondary'}">Todos</a>
            <a href="/admin/stories?status=pending" class="btn btn-sm ${status === 'pending' ? 'btn-primary' : 'btn-secondary'}">Pendientes</a>
            <a href="/admin/stories?status=approved" class="btn btn-sm ${status === 'approved' ? 'btn-primary' : 'btn-secondary'}">Aprobados</a>
            <a href="/admin/stories?status=rejected" class="btn btn-sm ${status === 'rejected' ? 'btn-primary' : 'btn-secondary'}">Rechazados</a>
          </div>
        </div>

        <!-- Table -->
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8fafc; text-align: left; color: #64748b; font-size: 0.9em;">
                <th style="padding: 15px 20px;">Fecha</th>
                <th style="padding: 15px 20px;">Título / Autor</th>
                <th style="padding: 15px 20px;">Archivo</th>
                <th style="padding: 15px 20px;">Estado</th>
                <th style="padding: 15px 20px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${stories.length === 0 ? html`
                <tr>
                  <td colspan="5" style="padding: 40px; text-align: center; color: #94a3b8;">
                    No se encontraron historias.
                  </td>
                </tr>
              ` : stories.map(story => html`
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 15px 20px;">
                    ${new Date(story.created_at).toLocaleDateString('es-ES')} <br>
                    <span style="font-size: 0.8em; color: #94a3b8;">${new Date(story.created_at).toLocaleTimeString('es-ES')}</span>
                  </td>
                  <td style="padding: 15px 20px;">
                    <div style="font-weight: 500; color: #1e293b;">${story.meta_title || 'Sin título'}</div>
                    <div style="font-size: 0.9em; color: #64748b;">${story.meta_author || 'Anónimo'}</div>
                  </td>
                  <td style="padding: 15px 20px;">
                     <a href="/media/${story.r2_key}" target="_blank" style="display: flex; align-items: center; gap: 8px; text-decoration: none; color: #8b5cf6; font-weight: 500;">
                       <i class="fas fa-file-code"></i> ${story.original_filename}
                     </a>
                  </td>
                  <td style="padding: 15px 20px;">
                    ${StatusBadge(story.status)}
                  </td>
                  <td style="padding: 15px 20px;">
                    ${story.status === 'pending' ? html`
                       <div style="display: flex; gap: 5px;">
                         <form action="/admin/stories/${story.id}/status" method="POST" style="display:inline;">
                           <input type="hidden" name="status" value="approved">
                           <button class="btn btn-sm" style="background: #dcfce7; color: #15803d; border: none;" title="Aprobar"><i class="fas fa-check"></i></button>
                         </form>
                         <form action="/admin/stories/${story.id}/status" method="POST" style="display:inline;">
                           <input type="hidden" name="status" value="rejected">
                           <button class="btn btn-sm" style="background: #fee2e2; color: #b91c1c; border: none;" title="Rechazar"><i class="fas fa-times"></i></button>
                         </form>
                       </div>
                    ` : html`
                       <span style="color: #cbd5e1;">-</span>
                    `}
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        ${totalPages > 1 ? html`
          <div style="padding: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: center; gap: 10px;">
            ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => html`
              <a href="/admin/stories?page=${p}${status ? `&status=${status}` : ''}"
                 class="btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}">
                ${p}
              </a>
            `)}
          </div>
        ` : ''}

      </div>
    `
  }))
})

// UPDATE Status
app.post('/:id/status', async (c) => {
  const id = parseInt(c.req.param('id'))
  if (Number.isNaN(id)) {
    return c.text('Invalid id', 400)
  }
  const body = await c.req.parseBody()
  const status = body['status'] as 'approved' | 'rejected'

  if (status !== 'approved' && status !== 'rejected') {
    return c.text('Invalid status', 400)
  }

  const changes = await updateStoryStatus(c.env.DB, id, status)

  if (!changes) {
    return c.text('Story not found', 404)
  }

  // Redirect back to list
  return c.redirect('/admin/stories?status=pending')
})

export default app
