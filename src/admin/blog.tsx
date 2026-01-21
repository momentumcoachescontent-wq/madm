import { Hono } from 'hono'
import { html } from 'hono/html'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Helper for Admin Layout (simplified)
const AdminLayout = (children: any, title: string) => html`
  <div class="admin-container" style="padding: 20px;">
    <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
      <h1>${title}</h1>
      <a href="/admin" class="btn btn-secondary">
        <i class="fas fa-arrow-left"></i> Volver al Dashboard
      </a>
    </div>
    ${children}
  </div>
`

// Helper: Form View
const PostForm = (post: any = {}) => {
  const isEdit = !!post.id
  const action = isEdit ? `/admin/blog/${post.id}` : '/admin/blog'

  // Format date for datetime-local input (YYYY-MM-DDThh:mm)
  let scheduledAt = ''
  if (post.scheduled_at) {
    const d = new Date(post.scheduled_at)
    scheduledAt = d.toISOString().slice(0, 16)
  }

  return html`
    <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
    <style>
      .editor-container { background: white; height: 400px; margin-bottom: 20px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
    </style>

    <form method="POST" action="${action}" id="postForm" enctype="multipart/form-data">
      <div class="form-group">
        <label>Título</label>
        <input type="text" name="title" value="${post.title || ''}" required>
      </div>

      <div class="form-group">
        <label>Slug (URL)</label>
        <input type="text" name="slug" value="${post.slug || ''}" required>
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
          <label>Estado</label>
          <select name="published">
            <option value="0" ${!post.published ? 'selected' : ''}>Borrador</option>
            <option value="1" ${post.published ? 'selected' : ''}>Publicado</option>
          </select>
        </div>

        <div class="form-group" style="flex: 1;">
          <label>Programar Publicación</label>
          <input type="datetime-local" name="scheduled_at" value="${scheduledAt}">
          <small>Dejar vacío para publicar inmediatamente (si el estado es Publicado)</small>
        </div>
      </div>

      <button type="submit" class="btn btn-primary btn-lg">
        <i class="fas fa-save"></i> Guardar Post
      </button>
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
        formData.append('image', file);

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
          formData.append('image', file);

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
      <a href="/admin/blog/new" class="btn btn-primary">
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
          ${posts.results?.map((post: any) => html`
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 15px;">
                <strong>${post.title}</strong><br>
                <small style="color: #64748b;">/${post.slug}</small>
              </td>
              <td style="padding: 15px;">
                ${post.published
                  ? html`<span class="badge" style="background: #10b981; color: white; padding: 4px 8px; border-radius: 4px;">Publicado</span>`
                  : html`<span class="badge" style="background: #cbd5e1; color: #475569; padding: 4px 8px; border-radius: 4px;">Borrador</span>`
                }
              </td>
              <td style="padding: 15px;">
                ${post.scheduled_at
                  ? new Date(post.scheduled_at).toLocaleString()
                  : '-'
                }
              </td>
              <td style="padding: 15px;">${post.views || 0}</td>
              <td style="padding: 15px; text-align: right;">
                <a href="/admin/blog/${post.id}/edit" class="btn btn-sm btn-secondary">
                  <i class="fas fa-edit"></i>
                </a>
                <a href="/blog/${post.slug}" target="_blank" class="btn btn-sm btn-outline">
                  <i class="fas fa-external-link-alt"></i>
                </a>
              </td>
            </tr>
          `)}
        </tbody>
      </table>
    </div>
  `, 'Gestión de Blog'))
})

// CREATE FORM
app.get('/new', (c) => {
  return c.render(AdminLayout(PostForm(), 'Crear Nuevo Post'))
})

// EDIT FORM
app.get('/:id/edit', async (c) => {
  const id = c.req.param('id')
  const post = await c.env.DB.prepare('SELECT * FROM blog_posts WHERE id = ?').bind(id).first()

  if (!post) return c.notFound()

  // Fetch versions
  const versions = await c.env.DB.prepare(`
    SELECT id, created_at, title
    FROM blog_post_versions
    WHERE post_id = ?
    ORDER BY created_at DESC
    LIMIT 10
  `).bind(id).all()

  const VersionsList = html`
    <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
      <h3>Historial de Versiones</h3>
      <ul style="list-style: none; padding: 0;">
        ${versions.results?.map((v: any) => html`
          <li style="padding: 10px; border-bottom: 1px solid #eee;">
            <i class="fas fa-history"></i>
            <strong>${new Date(v.created_at).toLocaleString()}</strong>
            <br>
            <small>${v.title}</small>
            <!-- Here we could add a "View" or "Restore" button if needed later -->
          </li>
        `)}
      </ul>
    </div>
  `

  return c.render(AdminLayout(html`
    ${PostForm(post)}
    ${VersionsList}
  `, 'Editar Post'))
})

// CREATE ACTION
app.post('/', async (c) => {
  const body = await c.req.parseBody()

  const title = body['title'] as string
  const slug = body['slug'] as string
  const content = body['content'] as string
  const excerpt = body['excerpt'] as string
  const image_url = body['image_url'] as string
  const hashtags = body['hashtags'] as string
  const published = body['published'] === '1' ? 1 : 0
  const scheduled_at = body['scheduled_at'] ? body['scheduled_at'] : null

  try {
    const res = await c.env.DB.prepare(`
      INSERT INTO blog_posts (title, slug, content, excerpt, image_url, hashtags, published, scheduled_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(title, slug, content, excerpt, image_url, hashtags, published, scheduled_at).run()

    const postId = res.meta.last_row_id

    // Create initial version
    await c.env.DB.prepare(`
      INSERT INTO blog_post_versions (post_id, title, content, excerpt, image_url)
      VALUES (?, ?, ?, ?, ?)
    `).bind(postId, title, content, excerpt, image_url).run()

    return c.redirect('/admin/blog')
  } catch (error) {
    return c.text('Error creating post: ' + (error as Error).message, 500)
  }
})

// UPDATE ACTION
app.post('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.parseBody()

  const title = body['title'] as string
  const slug = body['slug'] as string
  const content = body['content'] as string
  const excerpt = body['excerpt'] as string
  const image_url = body['image_url'] as string
  const hashtags = body['hashtags'] as string
  const published = body['published'] === '1' ? 1 : 0
  const scheduled_at = body['scheduled_at'] ? body['scheduled_at'] : null

  try {
    // Save version first (save the NEW state as a version, or old state?
    // Requirement says "Versioning of content". Typically we save the state being saved.

    await c.env.DB.prepare(`
      UPDATE blog_posts
      SET title = ?, slug = ?, content = ?, excerpt = ?, image_url = ?, hashtags = ?, published = ?, scheduled_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(title, slug, content, excerpt, image_url, hashtags, published, scheduled_at, id).run()

    // Insert version
    await c.env.DB.prepare(`
      INSERT INTO blog_post_versions (post_id, title, content, excerpt, image_url)
      VALUES (?, ?, ?, ?, ?)
    `).bind(id, title, content, excerpt, image_url).run()

    return c.redirect('/admin/blog')
  } catch (error) {
    return c.text('Error updating post: ' + (error as Error).message, 500)
  }
})

export default app
