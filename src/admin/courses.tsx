import { Hono } from 'hono'
import { AdminLayout } from './layout'
import { createSlug } from './utils'

const app = new Hono<{ Bindings: any }>()

// List Courses
app.get('/', async (c) => {
  const user = c.get('user')
  const courses = await c.env.DB.prepare('SELECT * FROM courses ORDER BY created_at DESC').all()

  return c.html(
    (<AdminLayout title="Cursos" user={user}>
      <div className="flex justify-end mb-4">
        <a href="/admin/courses/new" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
          <i className="fas fa-plus mr-2"></i> Nuevo Curso
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.results?.length ? courses.results.map((course: any) => (
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
             <div className="h-40 bg-gray-200 relative">
               {course.featured_image ? (
                 <img src={course.featured_image} className="w-full h-full object-cover" />
               ) : (
                 <div className="flex items-center justify-center h-full text-gray-400">
                   <i className="fas fa-image fa-3x"></i>
                 </div>
               )}
               <div className="absolute top-2 right-2">
                 <span className={`px-2 py-1 rounded text-xs font-bold ${course.published ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                   {course.published ? 'Publicado' : 'Borrador'}
                 </span>
               </div>
             </div>
             <div className="p-4">
               <h3 className="font-bold text-lg mb-1 truncate">{course.title}</h3>
               <p className="text-gray-500 text-sm mb-4 truncate">{course.subtitle}</p>
               <div className="flex justify-between items-center">
                 <span className="font-bold text-purple-600">${course.price} {course.currency}</span>
                 <a href={`/admin/courses/${course.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                   Gestionar <i className="fas fa-arrow-right ml-1"></i>
                 </a>
               </div>
             </div>
          </div>
        )) : (
          <div className="col-span-3 text-center py-10 text-gray-500">No hay cursos creados</div>
        )}
      </div>
    </AdminLayout>).toString()
  )
})

// New Course Form
app.get('/new', (c) => {
  const user = c.get('user')
  return c.html(
    (<AdminLayout title="Nuevo Curso" user={user}>
      <form action="/admin/courses" method="POST" className="max-w-3xl">
        <div className="grid grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Título</label>
            <input type="text" name="title" required className="w-full border rounded p-2" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Subtítulo</label>
            <input type="text" name="subtitle" className="w-full border rounded p-2" />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Descripción</label>
          <textarea name="description" rows={5} required className="w-full border rounded p-2"></textarea>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Precio</label>
            <input type="number" step="0.01" name="price" defaultValue="0" className="w-full border rounded p-2" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Moneda</label>
            <select name="currency" className="w-full border rounded p-2">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="MXN">MXN</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Duración (semanas)</label>
            <input type="number" name="duration_weeks" defaultValue="4" className="w-full border rounded p-2" />
          </div>
        </div>

        <div className="mb-4">
           <label className="block text-gray-700 text-sm font-bold mb-2">Imagen Destacada URL</label>
           <input type="text" name="featured_image" className="w-full border rounded p-2" />
        </div>

        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Crear Curso</button>
      </form>
    </AdminLayout>).toString()
  )
})

// Create Action
app.post('/', async (c) => {
  const body = await c.req.parseBody()
  const { title, description, price, currency } = body
  const subtitle = body['subtitle'] || null
  const duration_weeks = body['duration_weeks'] || 4
  const featured_image = body['featured_image'] || null

  const slug = createSlug(title as string)

  const result = await c.env.DB.prepare(`
    INSERT INTO courses (title, slug, subtitle, description, price, currency, duration_weeks, featured_image, published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
  `).bind(title, slug, subtitle, description, price, currency, duration_weeks, featured_image).run()

  return c.redirect(`/admin/courses/${result.meta.last_row_id}`)
})

// Manage Course (Edit + Modules/Lessons)
app.get('/:id', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const course = await c.env.DB.prepare('SELECT * FROM courses WHERE id = ?').bind(id).first()

  if (!course) return c.text('Course not found', 404)

  const lessons = await c.env.DB.prepare(`
    SELECT * FROM lessons WHERE course_id = ? ORDER BY module_number ASC, order_index ASC
  `).bind(id).all()

  // Group by module
  const modules = new Map()
  if (lessons.results) {
    for (const lesson of lessons.results) {
        if (!modules.has(lesson.module_number)) {
            modules.set(lesson.module_number, [])
        }
        modules.get(lesson.module_number).push(lesson)
    }
  }

  // Convert map to sorted array
  const sortedModules = Array.from(modules.entries()).sort((a, b) => a[0] - b[0])

  return c.html(
    (<AdminLayout title={`Gestionar: ${course.title}`} user={user}>
      <div className="flex gap-6">
        {/* Left Col: Course Details */}
        <div className="w-1/3">
          <div className="bg-gray-50 p-4 rounded border">
            <h3 className="font-bold mb-4">Detalles del Curso</h3>
            <form action={`/admin/courses/${id}`} method="POST">
               {/* Simplified edit form */}
               <div className="mb-3">
                 <label className="block text-xs font-bold text-gray-500 uppercase">Título</label>
                 <input type="text" name="title" defaultValue={course.title} className="w-full border rounded p-1" />
               </div>
               <div className="mb-3">
                 <label className="block text-xs font-bold text-gray-500 uppercase">Slug</label>
                 <input type="text" name="slug" defaultValue={course.slug} className="w-full border rounded p-1 bg-gray-100" />
               </div>
               <div className="mb-3">
                 <label className="block text-xs font-bold text-gray-500 uppercase">Precio</label>
                 <input type="number" step="0.01" name="price" defaultValue={course.price} className="w-full border rounded p-1" />
               </div>
               <div className="mb-3">
                 <label className="flex items-center">
                   <input type="checkbox" name="published" value="1" checked={!!course.published} className="mr-2" />
                   <span className="text-sm">Publicado</span>
                 </label>
               </div>
               <button type="submit" className="w-full bg-blue-600 text-white py-1 rounded text-sm">Guardar Cambios</button>
            </form>
          </div>
        </div>

        {/* Right Col: Content */}
        <div className="w-2/3">
           <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-lg">Contenido del Curso</h3>
             <a href={`/admin/courses/${id}/lessons/new`} className="bg-purple-600 text-white px-3 py-1 rounded text-sm">
               <i className="fas fa-plus"></i> Nueva Lección
             </a>
           </div>

           {sortedModules.length > 0 ? sortedModules.map(([modNum, modLessons]) => (
             <div className="mb-6 bg-white border rounded shadow-sm">
               <div className="bg-gray-100 p-3 border-b font-bold flex justify-between">
                 <span>Módulo {modNum}</span>
                 <span className="text-xs text-gray-500 font-normal">{modLessons.length} lecciones</span>
               </div>
               <div className="divide-y">
                 {modLessons.map((lesson: any) => (
                   <div className="p-3 flex justify-between items-center hover:bg-gray-50">
                     <div className="flex items-center gap-3">
                       <span className="text-gray-400 text-sm w-6">{lesson.lesson_number}</span>
                       <span className="font-medium">{lesson.title}</span>
                       {!lesson.published && <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">Borrador</span>}
                     </div>
                     <div className="flex gap-2">
                       <a href={`/admin/courses/${id}/lessons/${lesson.id}`} className="text-blue-500 hover:text-blue-700">
                         <i className="fas fa-edit"></i>
                       </a>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )) : (
             <div className="text-center py-10 bg-gray-50 rounded border border-dashed">
               No hay contenido. Crea la primera lección.
             </div>
           )}
        </div>
      </div>
    </AdminLayout>).toString()
  )
})

// Update Course
app.post('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.parseBody()
  const { title, slug, price, published } = body

  await c.env.DB.prepare(`
    UPDATE courses SET title=?, slug=?, price=?, published=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).bind(title, slug, price, published ? 1 : 0, id).run()

  return c.redirect(`/admin/courses/${id}`)
})

// New Lesson Form
app.get('/:id/lessons/new', async (c) => {
  const user = c.get('user')
  const courseId = c.req.param('id')
  const course = await c.env.DB.prepare('SELECT title FROM courses WHERE id=?').bind(courseId).first()

  return c.html(
    (<AdminLayout title={`Nueva Lección: ${course.title}`} user={user}>
      <form action={`/admin/courses/${courseId}/lessons`} method="POST" className="max-w-3xl">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Módulo #</label>
            <input type="number" name="module_number" required className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Lección #</label>
            <input type="number" name="lesson_number" required className="w-full border rounded p-2" />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Título</label>
          <input type="text" name="title" required className="w-full border rounded p-2" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Descripción</label>
          <textarea name="description" rows={3} className="w-full border rounded p-2"></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Video URL (YouTube/Vimeo)</label>
          <input type="text" name="video_url" className="w-full border rounded p-2" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Contenido (HTML/Markdown)</label>
          <textarea name="content" rows={10} className="w-full border rounded p-2"></textarea>
        </div>

        <div className="mb-4">
          <label className="flex items-center">
             <input type="checkbox" name="published" value="1" checked className="mr-2" />
             <span className="text-sm">Publicado</span>
          </label>
        </div>

        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Guardar Lección</button>
      </form>
    </AdminLayout>).toString()
  )
})

// Create Lesson
app.post('/:id/lessons', async (c) => {
  const courseId = c.req.param('id')
  const body = await c.req.parseBody()
  const { module_number, lesson_number, title, published } = body

  const description = body['description'] || null
  const video_url = body['video_url'] || null
  const content = body['content'] || null

  // order_index logic: simply use lesson_number or a counter
  const order_index = parseInt(module_number as string) * 100 + parseInt(lesson_number as string)

  await c.env.DB.prepare(`
    INSERT INTO lessons (course_id, module_number, lesson_number, title, description, video_url, content, order_index, published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(courseId, module_number, lesson_number, title, description, video_url, content, order_index, published ? 1 : 0).run()

  return c.redirect(`/admin/courses/${courseId}`)
})

// Edit Lesson
app.get('/:courseId/lessons/:lessonId', async (c) => {
  const user = c.get('user')
  const { courseId, lessonId } = c.req.param()

  const lesson = await c.env.DB.prepare('SELECT * FROM lessons WHERE id=?').bind(lessonId).first()

  return c.html(
    (<AdminLayout title={`Editar Lección: ${lesson.title}`} user={user}>
      <form action={`/admin/courses/${courseId}/lessons/${lessonId}`} method="POST" className="max-w-3xl">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Módulo #</label>
            <input type="number" name="module_number" value={lesson.module_number} required className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Lección #</label>
            <input type="number" name="lesson_number" value={lesson.lesson_number} required className="w-full border rounded p-2" />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Título</label>
          <input type="text" name="title" value={lesson.title} required className="w-full border rounded p-2" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Descripción</label>
          <textarea name="description" rows={3} className="w-full border rounded p-2">{lesson.description}</textarea>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Video URL (YouTube/Vimeo)</label>
          <input type="text" name="video_url" value={lesson.video_url} className="w-full border rounded p-2" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Contenido (HTML/Markdown)</label>
          <textarea name="content" rows={10} className="w-full border rounded p-2">{lesson.content}</textarea>
        </div>

        <div className="mb-4">
          <label className="flex items-center">
             <input type="checkbox" name="published" value="1" checked={!!lesson.published} className="mr-2" />
             <span className="text-sm">Publicado</span>
          </label>
        </div>

        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Actualizar Lección</button>
      </form>
    </AdminLayout>).toString()
  )
})

// Update Lesson
app.post('/:courseId/lessons/:lessonId', async (c) => {
  const { courseId, lessonId } = c.req.param()
  const body = await c.req.parseBody()
  const { module_number, lesson_number, title, published } = body

  const description = body['description'] || null
  const video_url = body['video_url'] || null
  const content = body['content'] || null

  const order_index = parseInt(module_number as string) * 100 + parseInt(lesson_number as string)

  await c.env.DB.prepare(`
    UPDATE lessons SET module_number=?, lesson_number=?, title=?, description=?, video_url=?, content=?, order_index=?, published=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).bind(module_number, lesson_number, title, description, video_url, content, order_index, published ? 1 : 0, lessonId).run()

  return c.redirect(`/admin/courses/${courseId}`)
})

export default app
