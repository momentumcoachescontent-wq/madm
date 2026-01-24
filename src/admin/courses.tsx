import { Hono } from 'hono'
import { html } from 'hono/html'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

const AdminLayout = (children: unknown, title: string) => html`
  <div class="admin-container" style="padding: 20px; max-width: 1200px; margin: 0 auto;">
    <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
      <h1 style="color: #1e293b;">${title}</h1>
      <div style="display: flex; gap: 10px;">
        <a href="/admin/courses/new" class="btn btn-primary">
            <i class="fas fa-plus"></i> Nuevo Curso
        </a>
        <a href="/admin" class="btn btn-secondary">
            <i class="fas fa-arrow-left"></i> Volver al Panel
        </a>
      </div>
    </div>
    ${children}
  </div>
`

// Form Helper
const CourseForm = (course: any = {}) => {
  const isEdit = !!course.id
  const action = isEdit ? `/admin/courses/${course.id}` : '/admin/courses'

  return html`
    <form method="POST" action="${action}" style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div class="form-group">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Título</label>
          <input type="text" name="title" value="${course.title || ''}" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
        </div>

        <div class="form-group">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Slug</label>
          <input type="text" name="slug" value="${course.slug || ''}" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
        </div>
      </div>

      <div class="form-group" style="margin-top: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Subtítulo</label>
        <input type="text" name="subtitle" value="${course.subtitle || ''}" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
      </div>

      <div class="form-group" style="margin-top: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Descripción</label>
        <textarea name="description" rows="4" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">${course.description || ''}</textarea>
      </div>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 15px;">
        <div class="form-group">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Precio</label>
          <input type="number" step="0.01" name="price" value="${course.price || ''}" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
        </div>
        <div class="form-group">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Moneda</label>
          <select name="currency" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
            <option value="USD" ${course.currency === 'USD' ? 'selected' : ''}>USD</option>
            <option value="EUR" ${course.currency === 'EUR' ? 'selected' : ''}>EUR</option>
            <option value="MXN" ${course.currency === 'MXN' ? 'selected' : ''}>MXN</option>
          </select>
        </div>
        <div class="form-group">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Duración (Semanas)</label>
          <input type="number" name="duration_weeks" value="${course.duration_weeks || ''}" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
        </div>
        <div class="form-group">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Nivel</label>
          <select name="level" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
            <option value="beginner" ${course.level === 'beginner' ? 'selected' : ''}>Principiante</option>
            <option value="intermediate" ${course.level === 'intermediate' ? 'selected' : ''}>Intermedio</option>
            <option value="advanced" ${course.level === 'advanced' ? 'selected' : ''}>Avanzado</option>
            <option value="all_levels" ${course.level === 'all_levels' ? 'selected' : ''}>Todos los niveles</option>
          </select>
        </div>
      </div>

      <div class="form-group" style="margin-top: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Imagen Destacada (URL)</label>
        <input type="text" name="featured_image" value="${course.featured_image || ''}" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
      </div>

      <div class="form-group" style="margin-top: 20px;">
        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
          <input type="checkbox" name="published" value="1" ${course.published ? 'checked' : ''} style="width: 20px; height: 20px;">
          <span style="font-weight: 600;">Publicado</span>
        </label>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <button type="submit" class="btn btn-primary btn-lg">
          <i class="fas fa-save"></i> ${isEdit ? 'Guardar Cambios' : 'Crear Curso'}
        </button>
      </div>
    </form>
  `
}

// Helper: Course List
const CourseListHelper = (courses: any[]) => html`
    <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <table style="width: 100%; border-collapse: collapse;">
        <thead style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
          <tr>
            <th style="padding: 15px; text-align: left;">Curso</th>
            <th style="padding: 15px; text-align: left;">Precio</th>
            <th style="padding: 15px; text-align: left;">Nivel</th>
            <th style="padding: 15px; text-align: left;">Estado</th>
            <th style="padding: 15px; text-align: right;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${courses.map((course: any) => html`
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 15px;">
                <div style="font-weight: 700;">${course.title}</div>
                <small style="color: #64748b;">/${course.slug}</small>
              </td>
              <td style="padding: 15px;">${course.price} ${course.currency}</td>
              <td style="padding: 15px;">
                <span class="badge" style="background: #e0e7ff; color: #3730a3; padding: 4px 8px; border-radius: 4px;">
                  ${course.level}
                </span>
              </td>
              <td style="padding: 15px;">
                ${course.published
                  ? html`<span class="badge" style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px;">Publicado</span>`
                  : html`<span class="badge" style="background: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 4px;">Borrador</span>`
                }
              </td>
              <td style="padding: 15px; text-align: right;">
                <a href="/admin/courses/${course.id}" class="btn btn-sm btn-secondary">
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
  const courses = await c.env.DB.prepare('SELECT * FROM courses ORDER BY created_at DESC').all()

  return c.render(AdminLayout(CourseListHelper(courses.results || []), 'Gestión de Cursos'))
})

// New
app.get('/new', (c) => {
  return c.render(AdminLayout(CourseForm(), 'Crear Nuevo Curso'))
})

// Edit
app.get('/:id', async (c) => {
  const id = c.req.param('id')
  const course = await c.env.DB.prepare('SELECT * FROM courses WHERE id = ?').bind(id).first()
  if (!course) return c.notFound()
  return c.render(AdminLayout(CourseForm(course), 'Editar Curso'))
})

// Create Action
app.post('/', async (c) => {
  const body = await c.req.parseBody()

  try {
    await c.env.DB.prepare(`
      INSERT INTO courses (title, slug, subtitle, description, price, currency, duration_weeks, level, featured_image, published, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      body.title, body.slug, body.subtitle, body.description,
      body.price, body.currency, body.duration_weeks, body.level,
      body.featured_image, body.published ? 1 : 0
    ).run()

    return c.redirect('/admin/courses')
  } catch (error) {
    return c.text('Error creating course: ' + (error as Error).message, 500)
  }
})

// Update Action
app.post('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.parseBody()

  try {
    await c.env.DB.prepare(`
      UPDATE courses
      SET title = ?, slug = ?, subtitle = ?, description = ?, price = ?, currency = ?, duration_weeks = ?, level = ?, featured_image = ?, published = ?
      WHERE id = ?
    `).bind(
      body.title, body.slug, body.subtitle, body.description,
      body.price, body.currency, body.duration_weeks, body.level,
      body.featured_image, body.published ? 1 : 0, id
    ).run()

    return c.redirect('/admin/courses')
  } catch (error) {
    return c.text('Error updating course: ' + (error as Error).message, 500)
  }
})

export default app
