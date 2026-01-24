import { Hono } from 'hono'
import { html, raw } from 'hono/html'
import { VersioningService, Version } from '../lib/versioning'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Helper for Admin Layout
const AdminLayout = (children: unknown, title: string) => html`
  <div class="admin-container" style="padding: 20px;">
    <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
      <h1>${title}</h1>
      <a href="/admin/blog-posts" class="btn btn-secondary">
        <i class="fas fa-arrow-left"></i> Volver al Listado
      </a>
    </div>
    ${children}
  </div>
`

// Helper: Form View
const PostForm = (post: any = {}, isDraft: boolean = false, latestPublished: any = null) => {
  const isEdit = !!(Boolean(post.id))
  const action = isEdit ? "/admin/blog-posts/"+post.id : '/admin/blog-posts'

  // Format date for datetime-local input (YYYY-MM-DDThh:mm)
  // We keep this variable to pass the UTC string to the hidden input and JS
  let scheduledAtUtc = ''
  let isScheduled = false
  if (Boolean(post.scheduled_at)) {
    // This is already UTC from DB
    scheduledAtUtc = post.scheduled_at.replace(' ', 'T').slice(0, 19)
    if (new Date(scheduledAtUtc) > new Date()) {
      isScheduled = true
    }
  }

  return html`
    <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
    <style>
      .editor-container { background: white; height: 400px; margin-bottom: 20px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
      .alert { padding: 15px; border-radius: 4px; margin-bottom: 20px; }
      .alert-warning { background: #fff3cd; color: #856404; border: 1px solid #ffeeba; }
      .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; }
      .badge-draft { background: #e2e8f0; color: #475569; }
      .badge-published { background: #dcfce7; color: #166534; }
      .badge-scheduled { background: #dbeafe; color: #1e40af; }
    </style>

    ${isDraft ? html`
      <div class="alert alert-warning">
        <strong><i class="fas fa-exclamation-triangle"></i> Modo Borrador</strong><br>
        Estás editando un borrador no publicado (guardado el ${new Date(post.created_at || post.updated_at).toLocaleString()}).
        <br>
        <div style="margin-top: 10px;">
            <a href="/admin/blog-posts/${post.id}/discard-draft" class="btn btn-sm btn-outline" style="color: #856404; border-color: #856404;" onclick="return confirm('¿Estás seguro? Se perderán los cambios del borrador actual.')">
                Descartar cambios y volver a versión publicada
            </a>
        </div>
      </div>
    ` : ''}

    <form method="POST" action="${action}" id="postForm" enctype="multipart/form-data">
      <div class="form-group">
        <label>Título</label>
        <input type="text" name="title" value="${post.title || ''}" required>
      </div>

      <div class="form-group">
        <label>Slug (URL)</label>
        <input type="text" name="slug" value="${(Boolean(post.slug)) || ''}" required>
      </div>

      <div class="form-group">
        <label>Extracto</label>
        <textarea name="excerpt" rows="3">${post.excerpt || ''}</textarea>
      </div>

      <div class="form-group">
        <label>Imagen Destacada (URL)</label>
        <input type="text" name="image_url" id="imageUrlInput" value="${post.image_url || ''}">
        <div style="margin-top: 5px;">
           <label for="imageUpload" class="btn btn-sm btn-secondary" style="display:inline-block; width:auto;">
             <i class="fas fa-upload"></i> Subir Imagen
           </label>
           <input type="file" id="imageUpload" accept="image/*" style="display:none">
        </div>
      </div>

      <div class="form-group">
        <label>Contenido</label>
        <div id="editor">${html`${post.content || ''}`}</div>
        <input type="hidden" name="content" id="contentInput">
      </div>

      <div class="form-group">
        <label>Hashtags (separados por espacios)</label>
        <input type="text" name="hashtags" value="${post.hashtags || ''}">
      </div>

      <div style="display: flex; gap: 20px;">
        <div class="form-group" style="flex: 1;">
          <label>Programar Publicación (Tu hora local)</label>
          <input type="datetime-local" name="scheduled_at_local" id="scheduledAtLocalInput">
          <input type="hidden" name="scheduled_at" id="scheduledAtHiddenInput" value="${scheduledAtUtc}">
          <small>Si seleccionas una fecha futura, el post se programará automáticamente.</small>
        </div>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; display: flex; gap: 15px; align-items: center;">
        <button type="submit" name="action" value="draft" class="btn btn-secondary btn-lg">
          <i class="fas fa-save"></i> Guardar Borrador
        </button>

        <button type="submit" name="action" value="publish" id="publishBtn" class="btn btn-primary btn-lg">
          <i class="fas fa-paper-plane"></i> Publicar Cambios
        </button>

        <span style="color: #64748b; margin-left: auto;">
            ${isEdit ? html`Estado actual:
                ${post.published
                    ? (isScheduled
                        ? html`<span class="badge badge-scheduled">Programado</span>`
                        : html`<span class="badge badge-published">Publicado</span>`)
                    : html`<span class="badge badge-draft">Borrador</span>`}`
            : ''}
        </span>
      </div>
    </form>

    <script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
    <script>
      // Init Quill
      var quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['link', 'image', 'video'],
            ['clean']
          ]
        }
      });

      // Handle Image Upload within Editor
      var toolbar = quill.getModule('toolbar');
      toolbar.addHandler('image', showImageHandler);

      function showImageHandler() {
        var input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
          var file = input.files[0];
          if (file) {
            uploadAndInsertImage(file);
          }
        };
      }

      async function uploadAndInsertImage(file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
          const response = await fetch('/admin/upload', {
            method: 'POST',
            body: formData
          });
          const data = await response.json();
          if (data.url) {
            const range = quill.getSelection();
            quill.insertEmbed(range.index, 'image', data.url);
          } else {
            alert('Error uploading image');
          }
        } catch (e) {
          console.error(e);
          alert('Error uploading image');
        }
      }

      // Handle Featured Image Upload
      document.getElementById('imageUpload').addEventListener('change', async (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const formData = new FormData();
          formData.append('file', file);

          try {
            const btn = document.querySelector('label[for="imageUpload"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo...';

            const response = await fetch('/admin/upload', {
              method: 'POST',
              body: formData
            });
            const data = await response.json();

            btn.innerHTML = originalText;

            if (data.url) {
              document.getElementById('imageUrlInput').value = data.url;
            } else {
              alert('Error uploading image');
            }
          } catch (e) {
            console.error(e);
            alert('Error uploading image');
          }
        }
      });

      // --- Scheduled Date Handling ---
      const localInput = document.getElementById('scheduledAtLocalInput');
      const hiddenInput = document.getElementById('scheduledAtHiddenInput');
      const publishBtn = document.getElementById('publishBtn');
      const publishIcon = publishBtn.querySelector('i');

      // 1. Initialize Local Input from UTC Hidden Input
      if (hiddenInput.value) {
        // Parse UTC string (YYYY-MM-DDTHH:mm:ss or similar)
        // We append 'Z' to ensure it is treated as UTC if it's not already ISO
        let utcString = hiddenInput.value;
        if (!utcString.endsWith('Z') && !utcString.includes('+')) {
            utcString += 'Z';
        }

        try {
            const date = new Date(utcString);
            if (!isNaN(date.getTime())) {
                // Convert to Local ISO string for input (YYYY-MM-DDTHH:mm)
                // We need to account for timezone offset manually to format it correctly for the input
                const offset = date.getTimezoneOffset() * 60000;
                const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
                localInput.value = localISOTime;
                updateButtonState();
            }
        } catch (e) {
            console.error('Error parsing date:', e);
        }
      }

      // 2. Listen for changes to update Hidden Input (UTC)
      localInput.addEventListener('change', () => {
        if (localInput.value) {
            const date = new Date(localInput.value);
            // Convert to UTC string (YYYY-MM-DD HH:MM:SS format for SQLite preferred)
            const iso = date.toISOString(); // 2023-10-27T10:00:00.000Z
            // SQLite expects YYYY-MM-DD HH:MM:SS usually, but ISO string works if we are consistent.
            // Let's strip T and Z to make it look like our existing DB format: YYYY-MM-DD HH:MM:SS
            const sqliteFormat = iso.replace('T', ' ').slice(0, 19);
            hiddenInput.value = sqliteFormat;
        } else {
            hiddenInput.value = '';
        }
        updateButtonState();
      });

      function updateButtonState() {
        if (localInput.value) {
            const date = new Date(localInput.value);
            const now = new Date();
            if (date > now) {
                publishBtn.innerHTML = '<i class="fas fa-clock"></i> Programar Publicación';
                publishBtn.classList.remove('btn-primary');
                publishBtn.classList.add('btn-warning');
                publishBtn.style.backgroundColor = '#f59e0b';
                publishBtn.style.borderColor = '#d97706';
                publishBtn.style.color = 'white';
            } else {
                publishBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Publicar Cambios';
                publishBtn.className = 'btn btn-primary btn-lg'; // Reset classes
                publishBtn.style = ''; // Reset inline styles
            }
        } else {
            publishBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Publicar Cambios';
            publishBtn.className = 'btn btn-primary btn-lg';
            publishBtn.style = '';
        }
      }

      // Form Submit
      document.getElementById('postForm').onsubmit = function() {
        // Populate hidden input with HTML
        document.getElementById('contentInput').value = quill.root.innerHTML;
      };
    </script>
  `
}

// Routes

// LIST
app.get('/', async (c) => {
  const posts = await c.env.DB.prepare(`
    SELECT id, title, slug, published, created_at, scheduled_at, views
    FROM blog_posts
    ORDER BY created_at DESC
  `).all()

  return c.render(AdminLayout(html`
    <div style="margin-bottom: 20px;">
      <a href="/admin/blog-posts/new" class="btn btn-primary">
        <i class="fas fa-plus"></i> Nuevo Post
      </a>
    </div>

    <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <table style="width: 100%; border-collapse: collapse;">
        <thead style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
          <tr>
            <th style="padding: 15px; text-align: left;">Título</th>
            <th style="padding: 15px; text-align: left;">Estado</th>
            <th style="padding: 15px; text-align: left;">Programado</th>
            <th style="padding: 15px; text-align: left;">Vistas</th>
            <th style="padding: 15px; text-align: right;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${posts.results?.map((post: any) => {
            let isScheduled = false
            if (post.published && post.scheduled_at) {
                // Ensure UTC interpretation
                const utcString = post.scheduled_at.replace(' ', 'T') + (post.scheduled_at.includes('Z') ? '' : 'Z')
                if (new Date(utcString) > new Date()) {
                    isScheduled = true
                }
            }

            return html`
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 15px;">
                <strong>${post.title}</strong><br>
                <small style="color: #64748b;">/${post.slug}</small>
              </td>
              <td style="padding: 15px;">
                ${post.published
                  ? (isScheduled
                      ? html`<span class="badge" style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px;">Programado</span>`
                      : html`<span class="badge" style="background: #10b981; color: white; padding: 4px 8px; border-radius: 4px;">Publicado</span>`)
                  : html`<span class="badge" style="background: #cbd5e1; color: #475569; padding: 4px 8px; border-radius: 4px;">Borrador</span>`
                }
              </td>
              <td style="padding: 15px;">
                ${post.scheduled_at
                  ? new Date(post.scheduled_at.replace(' ', 'T') + (post.scheduled_at.includes('Z') ? '' : 'Z')).toLocaleString()
                  : '-'
                }
              </td>
              <td style="padding: 15px;">${post.views || 0}</td>
              <td style="padding: 15px; text-align: right;">
                <a href="/admin/blog-posts/${post.id}/edit" class="btn btn-sm btn-secondary">
                  <i class="fas fa-edit"></i>
                </a>
                <a href="/blog/${post.slug}" target="_blank" class="btn btn-sm btn-outline">
                  <i class="fas fa-external-link-alt"></i>
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  , 'Gestión de Blog'))
})

// CREATE FORM
app.get('/new', (c) => {
  return c.render(AdminLayout(PostForm(), 'Crear Nuevo Post'))
})

// VIEW VERSION / DIFF
app.get('/versions/:versionId', async (c) => {
  const versionId = c.req.param('versionId')
  const versioning = new VersioningService(c.env.DB)
  const version = await versioning.getVersion('blog_post', parseInt(versionId, 10))

  if (!version) return c.notFound()

  // Fetch live post for comparison
  const post = await c.env.DB
    .prepare('SELECT * FROM blog_posts WHERE id = ?')
    .bind(version['post_id'])
    .first()

  // Calculate Diff
  const diffContent = versioning.compareText((post?.content as string) || '', version.content || '')

  return c.render(
    AdminLayout(
      html`
        <div class="diff-container" style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
          <div class="version-meta" style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #eee;">
            <h2>Versión del ${new Date(version.created_at).toLocaleString()}</h2>
            <span class="badge" style="background: ${version.status === 'published' ? '#dcfce7' : '#e2e8f0'}">
              ${String(version.status || '').toUpperCase()}
            </span>
            <p><strong>Resumen de cambios:</strong> ${version.change_summary || 'N/A'}</p>

            <div style="margin-top: 15px;">
              <form method="POST" action="/admin/blog-posts/versions/${version.id}/restore" style="display: inline;">
                <button type="submit" class="btn btn-primary" onclick="return confirm('¿Restaurar esta versión? Se creará un nuevo borrador.')">
                  <i class="fas fa-undo"></i> Restaurar como Borrador
                </button>
              </form>
              <a href="/admin/blog-posts/${version['post_id']}/edit" class="btn btn-secondary">Cancelar</a>
            </div>
          </div>

          <h3>Comparación con versión actual (Live)</h3>
          <div style="margin-top: 10px; border: 1px solid #ddd; padding: 15px; border-radius: 4px; background: #f9f9f9;">
            ${raw(diffContent)}
          </div>
        </div>
      `,
      "Ver Versión"
    )
  )
})

// RESTORE VERSION
app.post('/versions/:versionId/restore', async (c) => {
    const versionId = c.req.param('versionId')
    const versioning = new VersioningService(c.env.DB)

    try {
        const version = await versioning.getVersion('blog_post', parseInt(versionId))
        if (!version) return c.notFound()

        await versioning.restoreVersion('blog_post', version['post_id'], parseInt(versionId))
        return c.redirect(`/admin/blog-posts/${version['post_id']}/edit`)
    } catch (e) {
        return c.text('Error restoring version: ' + (e as Error).message, 500)
    }
})

// DISCARD DRAFT
app.get('/:id/discard-draft', async (c) => {
    const id = c.req.param('id')

    // Delete ALL versions with status='draft' for this post
    await c.env.DB.prepare('DELETE FROM blog_post_versions WHERE post_id = ? AND status = ?').bind(id, 'draft').run()

    return c.redirect(`/admin/blog-posts/${id}/edit`)
})

// DELETE VERSION
app.post('/versions/:versionId/delete', async (c) => {
    const versionId = c.req.param('versionId')
    const versioning = new VersioningService(c.env.DB)

    try {
        const version = await versioning.getVersion('blog_post', parseInt(versionId))
        if (!version) return c.notFound()

        await versioning.deleteVersion('blog_post', parseInt(versionId))
        return c.redirect(`/admin/blog-posts/${version['post_id']}/edit`)
    } catch (e) {
        return c.text('Error deleting version: ' + (e as Error).message, 500)
    }
})


// EDIT FORM
app.get('/:id/edit', async (c) => {
  const id = c.req.param('id')
  const post = await c.env.DB.prepare('SELECT * FROM blog_posts WHERE id = ?').bind(id).first()

  if (!post) return c.notFound()

  const versioning = new VersioningService(c.env.DB)
  const versions = await versioning.getVersions('blog_post', parseInt(id))

  // Check for latest draft
  let workingCopy = post
  let isDraft = false

  if (versions.length > 0) {
      const latest = versions[0]
      // Logic: if latest version is a draft, use it.
      if (latest.status === 'draft') {
          workingCopy = { ...post, ...latest, id: post.id } // keep original ID but overlay version data
          isDraft = true
      }
  }

  const VersionsList = html`
    <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
      <h3>Historial de Versiones</h3>
      <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left;">
                    <th style="padding: 10px;">Fecha</th>
                    <th style="padding: 10px;">Estado</th>
                    <th style="padding: 10px;">Cambios</th>
                    <th style="padding: 10px; text-align: right;">Acciones</th>
                </tr>
            </thead>
            <tbody>
            ${versions.map((v: any) => html`
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px;">${new Date(v.created_at).toLocaleString()}</td>
                <td style="padding: 10px;">
                    ${v.status === 'published'
                        ? html`<span class="badge badge-published">Publicado</span>`
                        : html`<span class="badge badge-draft">Borrador</span>`
                    }
                </td>
                <td style="padding: 10px; color: #64748b;">${v.change_summary || '-'}</td>
                <td style="padding: 10px; text-align: right;">
                    <a href="/admin/blog-posts/versions/${v.id}" class="btn btn-sm btn-outline" title="Ver / Restaurar">
                        <i class="fas fa-eye"></i>
                    </a>
                    <form method="POST" action="/admin/blog-posts/versions/${v.id}/delete" style="display:inline;" onsubmit="return confirm('¿Eliminar esta versión permanentemente?')">
                        <button type="submit" class="btn btn-sm btn-outline" style="color: #ef4444; border-color: #ef4444; margin-left: 5px;" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </form>
                </td>
              </tr>
            `)}
            </tbody>
        </table>
      </div>
    </div>
  `

  return c.render(AdminLayout(html`
    ${PostForm(workingCopy, isDraft)}
    ${VersionsList}
  `, 'Editar Post'))
})

// CREATE ACTION
app.post('/', async (c) => {
  const body = await c.req.parseBody()
  const action = body['action'] as string // 'draft' or 'publish'

  const title = body['title'] as string
  const slug = body['slug'] as string
  const content = body['content'] as string
  const excerpt = body['excerpt'] as string
  const image_url = body['image_url'] as string
  const hashtags = body['hashtags'] as string
  // If publishing, set published=1. If draft, published=0.
  // NOTE: For a NEW post, "Save Draft" means creating the post but not publishing it.
  const published = action === 'publish' ? 1 : 0
  const scheduled_at = body['scheduled_at'] ? body['scheduled_at'] : null

  const versioning = new VersioningService(c.env.DB)

  try {
    // 1. Create the main record (always needed for ID)
    const res = await c.env.DB.prepare(`
      INSERT INTO blog_posts (title, slug, content, excerpt, image_url, hashtags, published, scheduled_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(title, slug, content, excerpt, image_url, hashtags, published, scheduled_at).run()

    const postId = res.meta.last_row_id as number

    // 2. Create the initial version
    const versionStatus = action === 'publish' ? 'published' : 'draft'
    await versioning.createVersion('blog_post', postId, {
        title, content, excerpt, image_url, hashtags, scheduled_at
    }, versionStatus)

    return c.redirect('/admin/blog-posts')
  } catch (error) {
    return c.text('Error creating post: ' + (error as Error).message, 500)
  }
})

// UPDATE ACTION
app.post('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.parseBody()
  const action = body['action'] as string // 'draft' or 'publish'

  const title = body['title'] as string
  const slug = body['slug'] as string
  const content = body['content'] as string
  const excerpt = body['excerpt'] as string
  const image_url = body['image_url'] as string
  const hashtags = body['hashtags'] as string
  const scheduled_at = body['scheduled_at'] ? body['scheduled_at'] : null

  const versioning = new VersioningService(c.env.DB)

  try {
      // Get current live state to calculate summary if needed
      const currentLive = await c.env.DB.prepare('SELECT * FROM blog_posts WHERE id = ?').bind(id).first()

      if (action === 'publish') {
        // Update Live
        await c.env.DB.prepare(`
            UPDATE blog_posts
            SET title = ?, slug = ?, content = ?, excerpt = ?, image_url = ?, hashtags = ?, published = 1, scheduled_at = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).bind(title, slug, content, excerpt, image_url, hashtags, scheduled_at, id).run()

        // Create Published Version
        await versioning.createVersion('blog_post', parseInt(id), {
            title, content, excerpt, image_url, hashtags, scheduled_at
        }, 'published')

      } else {
        // Save Draft ONLY (do not update main table content)
        // Note: we might want to update updated_at? No, let's leave main table untouched so users know when it was last published.

        await versioning.createVersion('blog_post', parseInt(id), {
            title, content, excerpt, image_url, hashtags, scheduled_at
        }, 'draft')
      }

    return c.redirect('/admin/blog-posts/' + id + '/edit')
  } catch (error) {
    return c.text('Error updating post: ' + (error as Error).message, 500)
  }
})

export default app
