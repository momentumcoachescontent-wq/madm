import { Hono } from 'hono'
import { html } from 'hono/html'
import { adminMiddleware } from '../middleware/admin'
import { CloudflareBindings } from '../types'
import { AdminLayout } from './layout'
import blogApp from './blog'
import uploadApp from './upload'
import mediaApp from './media'
import usersApp from './users'
import coursesApp from './courses'
import lessonsApp from './lessons'

// Define Bindings if needed for types, though usually generic is enough for composition
const app = new Hono<{ Bindings: CloudflareBindings }>()

// Protect all admin routes
app.use('*', adminMiddleware)

// Helper: Dashboard View
const DashboardHelper = (postsCount: number, usersCount: number, coursesCount: any, lessonsCount: any) => html`
    <div style="margin-bottom: 40px;">
      <h1 style="font-size: 2.5rem; color: #1e293b; margin-bottom: 10px;">Panel de Administración</h1>
      <p style="color: #64748b; font-size: 1.2rem;">Bienvenido al centro de control de Más Allá del Miedo</p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">

      <!-- Blog Card -->
      <a href="/admin/blog-posts" style="text-decoration: none; color: inherit;">
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: transform 0.2s; height: 100%; border-left: 5px solid #8b5cf6;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
            <i class="fas fa-newspaper fa-3x" style="color: #8b5cf6;"></i>
            <span style="background: #f5f3ff; color: #8b5cf6; padding: 5px 12px; border-radius: 20px; font-weight: 600;">Blog</span>
          </div>
          <h2 style="font-size: 1.5rem; margin-bottom: 10px; color: #1e293b;">Gestionar Blog</h2>
          <p style="color: #64748b;">Crear artículos, editar contenido y programar publicaciones.</p>
          <div style="margin-top: 20px; font-size: 2rem; font-weight: 700; color: #8b5cf6;">
            ${postsCount} Posts
          </div>
        </div>
      </a>

      <!-- Courses Card -->
      <a href="/admin/courses" style="text-decoration: none; color: inherit;">
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: transform 0.2s; height: 100%; border-left: 5px solid #3b82f6;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
            <i class="fas fa-graduation-cap fa-3x" style="color: #3b82f6;"></i>
            <span style="background: #eff6ff; color: #3b82f6; padding: 5px 12px; border-radius: 20px; font-weight: 600;">Cursos</span>
          </div>
          <h2 style="font-size: 1.5rem; margin-bottom: 10px; color: #1e293b;">Gestionar Cursos</h2>
          <p style="color: #64748b;">Administrar cursos, precios y contenido.</p>
          <div style="margin-top: 20px; font-size: 2rem; font-weight: 700; color: #3b82f6;">
            ${coursesCount?.count || 0} Cursos
          </div>
        </div>
      </a>

      <!-- Lessons Card -->
      <a href="/admin/lessons" style="text-decoration: none; color: inherit;">
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: transform 0.2s; height: 100%; border-left: 5px solid #6366f1;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
            <i class="fas fa-play-circle fa-3x" style="color: #6366f1;"></i>
            <span style="background: #e0e7ff; color: #6366f1; padding: 5px 12px; border-radius: 20px; font-weight: 600;">Lecciones</span>
          </div>
          <h2 style="font-size: 1.5rem; margin-bottom: 10px; color: #1e293b;">Gestionar Lecciones</h2>
          <p style="color: #64748b;">Subir videos, editar descripciones y recursos.</p>
          <div style="margin-top: 20px; font-size: 2rem; font-weight: 700; color: #6366f1;">
            ${lessonsCount?.count || 0} Lecciones
          </div>
        </div>
      </a>

      <!-- Users Card -->
      <a href="/admin/users" style="text-decoration: none; color: inherit;">
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: transform 0.2s; height: 100%; border-left: 5px solid #f59e0b;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
            <i class="fas fa-users fa-3x" style="color: #f59e0b;"></i>
            <span style="background: #fffbeb; color: #f59e0b; padding: 5px 12px; border-radius: 20px; font-weight: 600;">Usuarios</span>
          </div>
          <h2 style="font-size: 1.5rem; margin-bottom: 10px; color: #1e293b;">Usuarios</h2>
          <p style="color: #64748b;">Gestionar usuarios registrados y permisos.</p>
          <div style="margin-top: 20px; font-size: 2rem; font-weight: 700; color: #f59e0b;">
            ${usersCount} Usuarios
          </div>
        </div>
      </a>

      <!-- Media Card -->
      <a href="/admin/media" style="text-decoration: none; color: inherit;">
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: transform 0.2s; height: 100%; border-left: 5px solid #10b981;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
            <i class="fas fa-images fa-3x" style="color: #10b981;"></i>
            <span style="background: #ecfdf5; color: #10b981; padding: 5px 12px; border-radius: 20px; font-weight: 600;">Media</span>
          </div>
          <h2 style="font-size: 1.5rem; margin-bottom: 10px; color: #1e293b;">Biblioteca Multimedia</h2>
          <p style="color: #64748b;">Gestionar imágenes, documentos y archivos.</p>
        </div>
      </a>

    </div>
`

// Main Dashboard
app.get('/', async (c) => {
  const { countBlogPosts } = await import('../models/blog')
  const { countUsers } = await import('../models/users')

  // Fetch stats
  const postsCount = await countBlogPosts(c.env.DB)
  const usersCount = await countUsers(c.env.DB)
  const coursesCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM courses').first()
  const lessonsCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM lessons').first()

  return c.html(AdminLayout({
    title: 'Dashboard',
    children: DashboardHelper(postsCount, usersCount, coursesCount, lessonsCount),
    activeItem: 'dashboard'
  }))
})

// Mount sub-apps
app.route('/blog-posts', blogApp) // Updated route
app.route('/upload', uploadApp)
app.route('/media', mediaApp)
app.route('/users', usersApp)
app.route('/courses', coursesApp)
app.route('/lessons', lessonsApp)

export default app
