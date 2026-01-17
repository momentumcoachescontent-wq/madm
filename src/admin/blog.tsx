import { Hono } from 'hono'
import { AdminLayout } from './layout'
import { createSlug, createExcerpt, getCategoryFromHashtags, getImageForCategory } from './utils'
import * as XLSX from 'xlsx'

const app = new Hono<{ Bindings: any }>()

// List
app.get('/', async (c) => {
  const user = c.get('user')
  const posts = await c.env.DB.prepare('SELECT * FROM blog_posts ORDER BY created_at DESC').all()

  return c.html(
    (<AdminLayout title="Blog Posts" user={user}>
      <div className="flex justify-between mb-4">
        <div>
           <form action="/admin/blog/import" method="POST" encType="multipart/form-data" className="flex gap-2 items-center">
             <input type="file" name="file" accept=".csv,.xlsx" required className="border rounded p-1 bg-white" />
             <button type="submit" className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 text-sm font-medium">
               <i className="fas fa-file-import mr-1"></i> Importar
             </button>
           </form>
        </div>
        <a href="/admin/blog/new" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
          <i className="fas fa-plus mr-2"></i> Nuevo Post
        </a>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-3">Título</th>
            <th className="p-3">Estado</th>
            <th className="p-3">Fecha</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {posts.results?.length ? posts.results.map((post: any) => (
            <tr className="border-b hover:bg-gray-50">
              <td className="p-3 font-medium">{post.title}</td>
              <td className="p-3">
                {post.published ?
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Publicado</span> :
                  <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Borrador</span>
                }
              </td>
              <td className="p-3 text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</td>
              <td className="p-3">
                <a href={`/admin/blog/${post.id}`} className="text-blue-600 hover:text-blue-800 mr-3">
                  <i className="fas fa-edit"></i>
                </a>
                <form action={`/admin/blog/${post.id}/delete`} method="POST" className="inline" onsubmit="return confirm('¿Eliminar?')">
                   <button type="submit" className="text-red-600 hover:text-red-800">
                     <i className="fas fa-trash"></i>
                   </button>
                </form>
              </td>
            </tr>
          )) : (
            <tr><td colSpan={4} className="p-4 text-center">No hay posts</td></tr>
          )}
        </tbody>
      </table>
    </AdminLayout>).toString()
  )
})

// Import Action
app.post('/import', async (c) => {
  try {
    const body = await c.req.parseBody()
    const file = body['file']

    if (!file || !(file instanceof File)) {
      return c.text('No file uploaded', 400)
    }

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    let count = 0
    const stmt = c.env.DB.prepare(`
      INSERT INTO blog_posts (title, slug, content, excerpt, hashtags, image_url, published)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `)

    const batch = []

    for (const row of data as any[]) {
        const titleKey = Object.keys(row).find(k => k.includes('Nombre del Post') || k.toLowerCase() === 'title')
        const contentKey = Object.keys(row).find(k => k.includes('Desarrollo Detallado') || k.toLowerCase() === 'content')
        const hashtagsKey = Object.keys(row).find(k => k.includes('Hashtags') || k.toLowerCase() === 'hashtags')

        const title = titleKey ? row[titleKey] : null
        if (!title) continue

        let content = contentKey ? (row[contentKey] || '') : ''
        const hashtags = hashtagsKey ? (row[hashtagsKey] || '') : ''

        // Apply logic from python script
        if (content.length > 0 && content.length < 250) {
            content += "\n\n**Reflexión práctica:** Este concepto se aplica directamente en tu vida diaria. Cada vez que sientes resistencia interna, pregúntate: ¿esto es miedo protector o miedo limitante? La diferencia marca el camino entre estancamiento y crecimiento."
        }
        if (content.length > 0 && !content.toLowerCase().includes('conclusión') && !content.toLowerCase().slice(-200).includes('clave')) {
            content += "\n\n**Conclusión:** El cambio real comienza con la comprensión de tus patrones mentales. No se trata de eliminar emociones, sino de aprender a interpretarlas y usarlas como brújula para tu crecimiento personal."
        }

        const slug = createSlug(title)
        const excerpt = createExcerpt(content)
        const category = getCategoryFromHashtags(hashtags)
        const image_url = getImageForCategory(category, count)

        batch.push(stmt.bind(title, slug, content, excerpt, hashtags, image_url))
        count++
    }

    if (batch.length > 0) {
        const chunkSize = 10 // D1 batch limit safe margin
        for (let i = 0; i < batch.length; i += chunkSize) {
            await c.env.DB.batch(batch.slice(i, i + chunkSize))
        }
    }

    return c.redirect('/admin/blog')

  } catch (e: any) {
    console.error(e)
    return c.text('Error importing: ' + e.message, 500)
  }
})

// New Form
app.get('/new', (c) => {
  const user = c.get('user')
  return c.html(
    (<AdminLayout title="Nuevo Post" user={user}>
      <form action="/admin/blog" method="POST" className="max-w-3xl">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Título</label>
          <input type="text" name="title" required className="w-full border rounded p-2" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Contenido</label>
          <textarea name="content" rows="10" required className="w-full border rounded p-2"></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Hashtags</label>
          <input type="text" name="hashtags" className="w-full border rounded p-2" />
        </div>
        <div className="mb-4">
           <label className="block text-gray-700 text-sm font-bold mb-2">Imagen URL</label>
           <input type="text" name="image_url" className="w-full border rounded p-2" />
           <p className="text-xs text-gray-500 mt-1">Sube una imagen en Multimedia y copia la URL aquí, o usa una externa.</p>
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input type="checkbox" name="published" value="1" checked className="mr-2" />
            <span className="text-sm font-bold text-gray-700">Publicado</span>
          </label>
        </div>
        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Guardar</button>
      </form>
    </AdminLayout>).toString()
  )
})

// Create Action
app.post('/', async (c) => {
  const body = await c.req.parseBody()
  const { title, content, published } = body
  const hashtags = body['hashtags'] || null
  const image_url = body['image_url'] || null

  const slug = createSlug(title as string)
  const excerpt = createExcerpt(content as string)

  await c.env.DB.prepare(`
    INSERT INTO blog_posts (title, slug, content, excerpt, hashtags, image_url, published)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(title, slug, content, excerpt, hashtags, image_url, published ? 1 : 0).run()

  return c.redirect('/admin/blog')
})

// Edit Form
app.get('/:id', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const post = await c.env.DB.prepare('SELECT * FROM blog_posts WHERE id = ?').bind(id).first()

  if (!post) return c.text('Post not found', 404)

  return c.html(
    (<AdminLayout title={`Editar: ${post.title}`} user={user}>
      <form action={`/admin/blog/${id}`} method="POST" className="max-w-3xl">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Título</label>
          <input type="text" name="title" required value={post.title} className="w-full border rounded p-2" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Slug</label>
          <input type="text" name="slug" required value={post.slug} className="w-full border rounded p-2 bg-gray-50" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Contenido</label>
          <textarea name="content" rows="10" required className="w-full border rounded p-2">{post.content}</textarea>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Hashtags</label>
          <input type="text" name="hashtags" value={post.hashtags} className="w-full border rounded p-2" />
        </div>
        <div className="mb-4">
           <label className="block text-gray-700 text-sm font-bold mb-2">Imagen URL</label>
           <input type="text" name="image_url" value={post.image_url} className="w-full border rounded p-2" />
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input type="checkbox" name="published" value="1" checked={!!post.published} className="mr-2" />
            <span className="text-sm font-bold text-gray-700">Publicado</span>
          </label>
        </div>
        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Actualizar</button>
      </form>
    </AdminLayout>).toString()
  )
})

// Update Action
app.post('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.parseBody()
  const { title, slug, content, published } = body
  const hashtags = body['hashtags'] || null
  const image_url = body['image_url'] || null

  const excerpt = createExcerpt(content as string)

  await c.env.DB.prepare(`
    UPDATE blog_posts SET title=?, slug=?, content=?, excerpt=?, hashtags=?, image_url=?, published=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).bind(title, slug, content, excerpt, hashtags, image_url, published ? 1 : 0, id).run()

  return c.redirect('/admin/blog')
})

// Delete Action
app.post('/:id/delete', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM blog_posts WHERE id=?').bind(id).run()
  return c.redirect('/admin/blog')
})

export default app
