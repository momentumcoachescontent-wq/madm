import { html } from 'hono/html'

type LayoutProps = {
  title: string
  children: any
  activeItem?: string
  headerActions?: any
}

export const AdminLayout = (props: LayoutProps) => {
  const { title, children, activeItem = 'dashboard', headerActions } = props

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-home', href: '/admin' },
    { id: 'blog', label: 'Blog', icon: 'fas fa-newspaper', href: '/admin/blog-posts' },
    { id: 'courses', label: 'Cursos', icon: 'fas fa-graduation-cap', href: '/admin/courses' },
    { id: 'lessons', label: 'Lecciones', icon: 'fas fa-play-circle', href: '/admin/lessons' },
    { id: 'users', label: 'Usuarios', icon: 'fas fa-users', href: '/admin/users' },
    { id: 'media', label: 'Media', icon: 'fas fa-images', href: '/admin/media' },
  ]

  return html`<!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} | Admin - Más Allá del Miedo</title>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

        <style>
            :root {
                --primary: #8b5cf6;
                --primary-dark: #7c3aed;
                --secondary: #64748b;
                --bg-dark: #1e293b;
                --bg-light: #f1f5f9;
                --text-main: #334155;
                --border: #e2e8f0;
            }
            * { box-sizing: border-box; }
            body {
                background: var(--bg-light);
                font-family: 'Inter', sans-serif;
                margin: 0;
                display: flex;
                height: 100vh;
                overflow: hidden;
                color: var(--text-main);
            }

            /* Sidebar */
            .admin-sidebar {
                width: 260px;
                background: var(--bg-dark);
                color: white;
                display: flex;
                flex-direction: column;
                flex-shrink: 0;
                transition: transform 0.3s ease;
                z-index: 50;
            }
            .sidebar-header {
                padding: 20px;
                border-bottom: 1px solid #334155;
                display: flex;
                align-items: center;
                gap: 12px;
                height: 70px;
            }
            .sidebar-logo {
                font-weight: 800;
                font-size: 1.1rem;
                color: white;
                text-decoration: none;
                letter-spacing: -0.5px;
            }
            .sidebar-nav { flex: 1; padding: 20px 0; overflow-y: auto; }
            .nav-item {
                display: flex;
                align-items: center;
                padding: 12px 25px;
                color: #94a3b8;
                text-decoration: none;
                transition: all 0.2s;
                border-left: 3px solid transparent;
                font-weight: 500;
            }
            .nav-item:hover { color: white; background: #334155; }
            .nav-item.active {
                color: white;
                background: #334155;
                border-left-color: var(--primary);
            }
            .nav-item i { width: 24px; text-align: center; margin-right: 12px; font-size: 1.1em; }

            .sidebar-footer {
                padding: 20px;
                border-top: 1px solid #334155;
                background: #0f172a;
            }

            /* Main Content */
            .admin-main {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                position: relative;
            }
            .admin-header {
                background: white;
                padding: 0 30px;
                height: 70px;
                border-bottom: 1px solid var(--border);
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-shrink: 0;
            }
            .header-title { display: flex; align-items: center; gap: 15px; }
            .header-title h1 { margin: 0; font-size: 1.25rem; font-weight: 600; color: #1e293b; }
            .menu-toggle { display: none; cursor: pointer; color: #64748b; font-size: 1.2rem; }

            .admin-content {
                flex: 1;
                overflow-y: auto;
                padding: 30px;
            }
            .admin-container { max-width: 1200px; margin: 0 auto; }

            /* Utility Classes */
            .btn {
                display: inline-flex; align-items: center; gap: 8px;
                padding: 8px 16px; border-radius: 6px;
                text-decoration: none; font-weight: 500; cursor: pointer;
                border: 1px solid transparent; transition: all 0.2s;
                font-size: 0.9rem; font-family: inherit;
            }
            .btn-primary { background: var(--primary); color: white; border-color: var(--primary); }
            .btn-primary:hover { background: var(--primary-dark); }
            .btn-secondary { background: white; color: #475569; border-color: #cbd5e1; }
            .btn-secondary:hover { background: #f8fafc; border-color: #94a3b8; }
            .btn-outline { background: transparent; color: var(--primary); border-color: var(--primary); }
            .btn-outline:hover { background: #f5f3ff; }
            .btn-sm { padding: 4px 10px; font-size: 0.8rem; }
            .btn-lg { padding: 10px 20px; font-size: 1rem; }

            .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: 600; }

            /* Responsive */
            @media (max-width: 768px) {
                .admin-sidebar {
                    position: absolute;
                    height: 100%;
                    transform: translateX(-100%);
                    box-shadow: 2px 0 10px rgba(0,0,0,0.2);
                }
                .admin-sidebar.open { transform: translateX(0); }
                .menu-toggle { display: block; }
                .admin-content { padding: 15px; }
            }
        </style>
    </head>
    <body>
        <aside class="admin-sidebar" id="sidebar">
            <div class="sidebar-header">
                <i class="fas fa-brain" style="color: var(--primary); font-size: 1.5rem;"></i>
                <a href="/admin" class="sidebar-logo">Admin Panel</a>
                <i class="fas fa-times menu-toggle" style="margin-left: auto; color: #94a3b8;"></i>
            </div>

            <nav class="sidebar-nav">
                ${menuItems.map(item => html`
                    <a href="${item.href}" class="nav-item ${activeItem === item.id ? 'active' : ''}">
                        <i class="${item.icon}"></i>
                        <span>${item.label}</span>
                    </a>
                `)}
            </nav>

            <div class="sidebar-footer">
                <a href="/" target="_blank" class="nav-item">
                    <i class="fas fa-external-link-alt"></i>
                    <span>Ver Sitio Web</span>
                </a>
                <button id="logout-btn" class="nav-item" style="width: 100%; background: none; border: none; cursor: pointer; text-align: left; padding: 12px 25px; font-family: inherit;">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>

        <main class="admin-main">
            <header class="admin-header">
                <div class="header-title">
                    <i class="fas fa-bars menu-toggle"></i>
                    <h1>${title}</h1>
                </div>
                <div class="header-actions">
                    ${headerActions || ''}
                </div>
            </header>

            <div class="admin-content">
                ${children}
            </div>
        </main>

        <script src="/static/admin.js"></script>
    </body>
    </html>
  `
}
