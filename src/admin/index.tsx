import { Hono } from 'hono'
import { html } from 'hono/html'
import { adminMiddleware } from '../middleware/admin'
import blogApp from './blog'
import uploadApp from './upload'
import mediaApp from './media'

// Define Bindings if needed for types, though usually generic is enough for composition
const app = new Hono()

// Protect all admin routes
app.use('*', adminMiddleware)

// Main Dashboard
app.get('/', (c) => {
  return c.render(html`
    <div class="admin-container" style="padding: 40px; max-width: 1200px; margin: 0 auto;">
      <div style="margin-bottom: 40px;">
        <h1 style="font-size: 2.5rem; color: #1e293b; margin-bottom: 10px;">Panel de Administración</h1>
        <p style="color: #64748b; font-size: 1.2rem;">Bienvenido al centro de control de Más Allá del Miedo</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">

        <!-- Blog Card -->
        <a href="/admin/blog" style="text-decoration: none; color: inherit;">
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: transform 0.2s; height: 100%; border-left: 5px solid #8b5cf6;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
              <i class="fas fa-newspaper fa-3x" style="color: #8b5cf6;"></i>
              <span style="background: #f5f3ff; color: #8b5cf6; padding: 5px 12px; border-radius: 20px; font-weight: 600;">Blog</span>
            </div>
            <h2 style="font-size: 1.5rem; margin-bottom: 10px; color: #1e293b;">Gestionar Blog</h2>
            <p style="color: #64748b;">Crear artículos, editar contenido y programar publicaciones.</p>
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

        <!-- Users Card (Placeholder) -->
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-left: 5px solid #f59e0b; opacity: 0.7;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
            <i class="fas fa-users fa-3x" style="color: #f59e0b;"></i>
            <span style="background: #fffbeb; color: #f59e0b; padding: 5px 12px; border-radius: 20px; font-weight: 600;">Usuarios</span>
          </div>
          <h2 style="font-size: 1.5rem; margin-bottom: 10px; color: #1e293b;">Usuarios</h2>
          <p style="color: #64748b;">Gestionar estudiantes y roles (Próximamente).</p>
        </div>

      </div>

      <div style="margin-top: 50px; text-align: center;">
        <a href="/" class="btn btn-outline" style="margin-right: 15px;">Ir al Sitio Web</a>
        <button onclick="logout()" class="btn btn-secondary">Cerrar Sesión</button>
      </div>
    </div>

    <script>
      async function logout() {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/login';
      }
    </script>
  `)
})

// Mount sub-apps
app.route('/blog', blogApp)
app.route('/upload', uploadApp)
app.route('/media', mediaApp)

export default app
