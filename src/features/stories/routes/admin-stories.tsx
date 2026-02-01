import { Hono } from 'hono'
import { html } from 'hono/html'
import { CloudflareBindings } from '../../../types'
import { AdminLayout } from '../../../admin/layout'
import { listStories, getStory, countStories } from '../models/stories'
import { sanitizeHtml } from '../../../lib/sanitize'

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
                <th style="padding: 15px 20px;">Título / Autor / Alias</th>
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
                    ${story.submitter_alias ? html`<div style="font-size: 0.8em; color: #3b82f6;">Alias: ${story.submitter_alias}</div>` : ''}
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
                    <a href="/admin/stories/${story.id}" class="btn btn-sm btn-primary" style="background: #3b82f6; border: none;">
                      ${story.status === 'pending' ? 'Revisar' : 'Ver'}
                    </a>
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

// DETAIL VIEW
app.get('/:id', async (c) => {
  const idStr = c.req.param('id')
  if (!/^\d+$/.test(idStr)) return c.redirect('/admin/stories')
  const id = Number(idStr)

  const story = await getStory(c.env.DB, id)
  if (!story) return c.redirect('/admin/stories')

  // Fetch Content
  let content = 'Error al cargar el contenido'
  let isTextSubmission = false

  if (story.r2_key === 'text-submission') {
    content = story.story_text || 'Sin contenido de texto.'
    isTextSubmission = true
  } else {
    try {
       const obj = await c.env.IMAGES_BUCKET.get(story.r2_key)
       if (obj) {
         content = await obj.text()
       }
    } catch (e) {
      console.error('Error fetching R2:', e)
    }
  }

  // Sanitize
  const safeHtmlContent = sanitizeHtml(content)

  return c.html(AdminLayout({
    title: `Historia #${story.id}`,
    activeItem: 'stories',
    headerActions: html`<a href="/admin/stories" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Volver</a>`,
    children: html`
      <div style="display: grid; grid-template-columns: 300px 1fr; gap: 20px; align-items: start;">

        <!-- Sidebar: Metadata & Actions -->
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
           <h3 style="margin-top: 0; color: #1e293b;">Detalles</h3>
           <dl>
             <dt style="font-size: 0.8em; color: #64748b; font-weight: 600;">Estado</dt>
             <dd style="margin-left: 0; margin-bottom: 15px;">${StatusBadge(story.status)}</dd>

             <dt style="font-size: 0.8em; color: #64748b; font-weight: 600;">Autor (Meta)</dt>
             <dd style="margin-left: 0; margin-bottom: 15px;">${story.meta_author || '-'}</dd>

             <dt style="font-size: 0.8em; color: #64748b; font-weight: 600;">Alias</dt>
             <dd style="margin-left: 0; margin-bottom: 15px;">${story.submitter_alias || '-'}</dd>

             <dt style="font-size: 0.8em; color: #64748b; font-weight: 600;">Subido</dt>
             <dd style="margin-left: 0; margin-bottom: 15px;">${new Date(story.created_at).toLocaleString()}</dd>

             <dt style="font-size: 0.8em; color: #64748b; font-weight: 600;">IP</dt>
             <dd style="margin-left: 0; margin-bottom: 15px;">${story.ip_address || 'N/A'}</dd>
           </dl>

           ${story.moderation_notes ? html`
             <div style="background: #fffbeb; padding: 10px; border-radius: 6px; margin-bottom: 20px;">
               <strong style="color: #b45309; display: block; margin-bottom: 5px;">Nota de Moderación:</strong>
               <p style="margin: 0; font-size: 0.9em; color: #78350f;">${story.moderation_notes}</p>
             </div>
           ` : ''}

           <!-- Thumbnail Management -->
           <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px; margin-bottom: 20px;">
             <h4 style="margin-top: 0; margin-bottom: 15px;">Imagen Destacada</h4>
             ${story.thumbnail_url ? html`
               <img src="${story.thumbnail_url}" alt="${story.meta_title ?? 'Story thumbnail'}" style="width: 100%; border-radius: 6px; margin-bottom: 10px; border: 1px solid #e2e8f0;" />
             ` : ''}
             <div style="display: flex; gap: 5px; flex-direction: column;">
               <input type="file" id="thumbnail-input" style="font-size: 0.8em; width: 100%;" accept="image/*" />
               <button id="btn-upload-thumbnail" class="btn btn-sm btn-secondary" style="width: 100%; margin-top: 5px;">
                 <i class="fas fa-upload"></i> ${story.thumbnail_url ? 'Cambiar Imagen' : 'Subir Imagen'}
               </button>
             </div>
           </div>

           ${story.status === 'pending' ? html`
             <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
               <h4 style="margin-top: 0; margin-bottom: 15px;">Revisión</h4>
               <button id="btn-approve" class="btn btn-primary" style="width: 100%; margin-bottom: 10px; background: #10b981; border-color: #10b981;">Aprobar</button>
               <button id="btn-reject" class="btn btn-secondary" style="width: 100%; background: #ef4444; color: white; border-color: #ef4444;">Rechazar</button>
             </div>
           ` : ''}

           <!-- Danger Zone -->
           <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
             <h4 style="margin-top: 0; margin-bottom: 15px; color: #b91c1c;">Zona de Peligro</h4>
             <button id="btn-delete" class="btn btn-sm btn-secondary" style="width: 100%; background: #fee2e2; color: #b91c1c; border-color: #fca5a5;">
               <i class="fas fa-trash"></i> Eliminar Historia
             </button>
           </div>
        </div>

        <!-- Main: Preview -->
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
           <h2 style="margin-top: 0; margin-bottom: 20px;">Vista Previa: ${story.meta_title}</h2>
           <div style="border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; background: #fafafa; min-height: 400px; ${isTextSubmission ? 'white-space: pre-wrap;' : ''}">
             ${html`${safeHtmlContent}`}
           </div>
        </div>

      </div>

      <!-- Scripts -->
      <script>
        const storyId = ${story.id};

        document.getElementById('btn-approve')?.addEventListener('click', async () => {
          if (!confirm('¿Aprobar esta historia?')) return;

          try {
            const res = await fetch('/api/admin/stories/' + storyId + '/approve', { method: 'POST' });
            if (res.ok) {
              window.location.reload();
            } else {
              const data = await res.json().catch(() => ({}));
              alert('Error al aprobar: ' + (data.error || 'Error desconocido'));
            }
          } catch(e) { alert('Error: ' + e.message); }
        });

        document.getElementById('btn-reject')?.addEventListener('click', async () => {
          const notes = prompt('Ingrese el motivo del rechazo (obligatorio):');
          if (notes === null) return; // Cancelled
          if (!notes.trim()) {
            alert('El motivo es obligatorio.');
            return;
          }

          try {
            const res = await fetch('/api/admin/stories/' + storyId + '/reject', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ notes })
            });
            if (res.ok) {
              window.location.reload();
            } else {
              const data = await res.json();
              alert('Error: ' + (data.error || 'Error al rechazar'));
            }
          } catch(e) { alert('Error: ' + e.message); }
        });

        document.getElementById('btn-delete')?.addEventListener('click', async () => {
          if (!confirm('¿Estás seguro de que deseas ELIMINAR esta historia permanentemente? Esta acción no se puede deshacer.')) return;

          try {
            const res = await fetch('/api/admin/stories/' + storyId, { method: 'DELETE' });
            if (res.ok) {
              alert('Historia eliminada.');
              window.location.href = '/admin/stories';
            } else {
              const data = await res.json().catch(() => ({}));
              alert('Error al eliminar: ' + (data.error || 'Error desconocido'));
            }
          } catch(e) { alert('Error: ' + e.message); }
        });

        document.getElementById('btn-upload-thumbnail')?.addEventListener('click', async () => {
          const input = document.getElementById('thumbnail-input');
          if (!input.files || input.files.length === 0) {
             alert('Por favor selecciona una imagen primero.');
             return;
          }

          const file = input.files[0];
          const formData = new FormData();
          formData.append('file', file);
          formData.append('width', '800'); // Resize for row layout

          const btn = document.getElementById('btn-upload-thumbnail');
          const originalHTML = btn.innerHTML;
          btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo...';
          btn.disabled = true;

          try {
             // 1. Upload directly to Story endpoint (handles overwrite & cleanup)
             const res = await fetch('/api/admin/stories/' + storyId + '/thumbnail-upload', {
               method: 'POST',
               body: formData
             });
             const data = await res.json();

             if (!res.ok || !data.success) {
               throw new Error(data.error || 'Error al subir imagen');
             }

             // Reload to see changes
             window.location.reload();

          } catch (e) {
             alert('Error: ' + e.message);
             btn.innerHTML = originalHTML;
             btn.disabled = false;
          }
        });
      </script>
    `
  }))
})

export default app
