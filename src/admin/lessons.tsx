import { Hono } from 'hono'
import { html } from 'hono/html'
import { AdminLayout } from './layout'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Form Helper
const LessonForm = (lesson: any = {}, courses: any[] = []) => {
  const isEdit = !!lesson.id
  const action = isEdit ? `/admin/lessons/${lesson.id}` : '/admin/lessons'

  return html`
    <form method="POST" action="${action}" style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 20px;">
        <div class="form-group">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Curso</label>
          <select name="course_id" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
            <option value="">Seleccionar Curso</option>
            ${courses.map(c => html`
              <option value="${c.id}" ${lesson.course_id === c.id ? 'selected' : ''}>${c.title}</option>
            `)}
          </select>
        </div>

        <div class="form-group">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Módulo #</label>
          <input type="number" name="module_number" value="${lesson.module_number || 1}" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
        </div>

        <div class="form-group">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Lección #</label>
          <input type="number" name="lesson_number" value="${lesson.lesson_number || 1}" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
        </div>
      </div>

      <div class="form-group" style="margin-top: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Título</label>
        <input type="text" name="title" value="${lesson.title || ''}" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
      </div>

      <div class="form-group" style="margin-top: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Descripción Corta</label>
        <textarea name="description" rows="2" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">${lesson.description || ''}</textarea>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
        <div class="form-group">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">URL del Video</label>
          <input type="text" name="video_url" value="${lesson.video_url || ''}" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
        </div>
        <div class="form-group">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Duración (segundos)</label>
          <input type="number" name="video_duration" value="${lesson.video_duration || 0}" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
        </div>
      </div>

      <div class="form-group" style="margin-top: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Contenido (HTML)</label>
        <textarea name="content" rows="6" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">${lesson.content || ''}</textarea>
      </div>

      <div style="display: flex; gap: 20px; margin-top: 20px;">
        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
          <input type="checkbox" name="published" value="1" ${lesson.published ? 'checked' : ''} style="width: 20px; height: 20px;">
          <span style="font-weight: 600;">Publicado</span>
        </label>

        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
          <input type="checkbox" name="is_preview" value="1" ${lesson.is_preview ? 'checked' : ''} style="width: 20px; height: 20px;">
          <span style="font-weight: 600;">Vista Previa Gratuita</span>
        </label>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <button type="submit" class="btn btn-primary btn-lg">
          <i class="fas fa-save"></i> ${isEdit ? 'Guardar Cambios' : 'Crear Lección'}
        </button>
      </div>
    </form>
  `
}

// Helper: Lesson List
const LessonListHelper = (lessons: any[]) => html`
    <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <table style="width: 100%; border-collapse: collapse;">
        <thead style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
          <tr>
            <th style="padding: 15px; text-align: left;">Curso</th>
            <th style="padding: 15px; text-align: left;">Módulo</th>
            <th style="padding: 15px; text-align: left;">Lección</th>
            <th style="padding: 15px; text-align: left;">Título</th>
            <th style="padding: 15px; text-align: left;">Estado</th>
            <th style="padding: 15px; text-align: right;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${lessons.map((lesson: any) => html`
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 15px; font-weight: 600;">${lesson.course_title}</td>
              <td style="padding: 15px;">${lesson.module_number}</td>
              <td style="padding: 15px;">${lesson.lesson_number}</td>
              <td style="padding: 15px;">
                ${lesson.title}
                ${lesson.is_preview ? html`<span style="margin-left: 5px; font-size: 0.8em; color: #d97706;">(Preview)</span>` : ''}
              </td>
              <td style="padding: 15px;">
                ${lesson.published
                  ? html`<span class="badge" style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px;">Publicado</span>`
                  : html`<span class="badge" style="background: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 4px;">Borrador</span>`
                }
              </td>
              <td style="padding: 15px; text-align: right;">
                <a href="/admin/lessons/${lesson.id}" class="btn btn-sm btn-secondary">
                  <i class="fas fa-edit"></i>
                </a>
              </td>
            </tr>
          `)}
        </tbody>
      </table>
    </div>
`

// List
app.get('/', async (c) => {
  const { listLessons } = await import('../models/lessons')
  const lessons = await listLessons(c.env.DB)

  return c.html(AdminLayout({
    title: 'Gestión de Lecciones',
    children: LessonListHelper(lessons),
    activeItem: 'lessons',
    headerActions: html`<a href="/admin/lessons/new" class="btn btn-primary"><i class="fas fa-plus"></i> Nueva Lección</a>`
  }))
})

// New
app.get('/new', async (c) => {
  const { listCourses } = await import('../models/courses')
  const courses = await listCourses(c.env.DB)
  // listCourses returns full objects, but that's fine for the form helper
  return c.html(AdminLayout({
    title: 'Crear Nueva Lección',
    children: LessonForm({}, courses),
    activeItem: 'lessons',
    headerActions: html`<a href="/admin/lessons" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Volver al Listado</a>`
  }))
})

// Edit
app.get('/:id', async (c) => {
  const { getLessonById } = await import('../models/lessons')
  const { listCourses } = await import('../models/courses')
  const id = c.req.param('id')
  const lesson = await getLessonById(c.env.DB, parseInt(id))
  if (!lesson) return c.notFound()

  const courses = await listCourses(c.env.DB)

  return c.html(AdminLayout({
    title: 'Editar Lección',
    children: LessonForm(lesson, courses),
    activeItem: 'lessons',
    headerActions: html`<a href="/admin/lessons" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Volver al Listado</a>`
  }))
})

// Create Action
app.post('/', async (c) => {
  const { createLesson } = await import('../models/lessons')
  const body = await c.req.parseBody()

  try {
    await createLesson(c.env.DB, {
      course_id: parseInt(body.course_id as string),
      module_number: parseInt(body.module_number as string),
      lesson_number: parseInt(body.lesson_number as string),
      title: body.title as string,
      description: body.description as string,
      video_url: body.video_url as string,
      video_duration: parseInt(body.video_duration as string || '0'),
      content: body.content as string,
      is_preview: body.is_preview ? 1 : 0,
      published: body.published ? 1 : 0
    })

    return c.redirect('/admin/lessons')
  } catch (error) {
    return c.text('Error creating lesson: ' + (error as Error).message, 500)
  }
})

// Update Action
app.post('/:id', async (c) => {
  const { updateLesson } = await import('../models/lessons')
  const id = c.req.param('id')
  const body = await c.req.parseBody()

  try {
    await updateLesson(c.env.DB, parseInt(id), {
      course_id: parseInt(body.course_id as string),
      module_number: parseInt(body.module_number as string),
      lesson_number: parseInt(body.lesson_number as string),
      title: body.title as string,
      description: body.description as string,
      video_url: body.video_url as string,
      video_duration: parseInt(body.video_duration as string || '0'),
      content: body.content as string,
      is_preview: body.is_preview ? 1 : 0,
      published: body.published ? 1 : 0
    })

    return c.redirect('/admin/lessons')
  } catch (error) {
    return c.text('Error updating lesson: ' + (error as Error).message, 500)
  }
})

export default app
