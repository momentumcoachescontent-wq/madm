import { html } from 'hono/html'

export const AdminLayout = (props: { title: string; children: any; user: any }) => {
  return (
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{props.title} - Admin Panel</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link
          href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{__html: `
          body { font-family: 'Inter', sans-serif; background-color: #f1f5f9; }
          .sidebar { width: 250px; background: #1e293b; color: white; min-height: 100vh; position: fixed; }
          .main-content { margin-left: 250px; padding: 30px; }
          .nav-item { display: block; padding: 12px 20px; color: #94a3b8; text-decoration: none; transition: all 0.2s; }
          .nav-item:hover, .nav-item.active { background: #334155; color: white; border-left: 4px solid #8b5cf6; }
          .nav-item i { width: 25px; }
        `}} />
      </head>
      <body>
        <div className="flex">
          <div className="sidebar">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                <i className="fas fa-brain text-purple-500 mr-2"></i>
                Admin Panel
              </h2>
            </div>
            <nav className="mt-4">
              <a href="/admin" className="nav-item">
                <i className="fas fa-tachometer-alt"></i> Dashboard
              </a>
              <a href="/admin/blog" className="nav-item">
                <i className="fas fa-newspaper"></i> Blog Posts
              </a>
              <a href="/admin/courses" className="nav-item">
                <i className="fas fa-graduation-cap"></i> Cursos
              </a>
              <a href="/admin/media" className="nav-item">
                <i className="fas fa-images"></i> Multimedia
              </a>
              <a href="/" target="_blank" className="nav-item mt-8 border-t border-gray-700">
                <i className="fas fa-external-link-alt"></i> Ver Sitio Web
              </a>
              <button onclick="logout()" className="nav-item w-full text-left cursor-pointer">
                <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
              </button>
            </nav>
            <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center font-bold">
                  {props.user.name.charAt(0)}
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-white">{props.user.name}</div>
                  <div className="text-gray-400 text-xs">Admin</div>
                </div>
              </div>
            </div>
          </div>
          <div className="main-content w-full">
            <header className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800">{props.title}</h1>
            </header>

            <div className="bg-white rounded-lg shadow-sm p-6">
              {props.children}
            </div>
          </div>
        </div>

        <script dangerouslySetInnerHTML={{__html: `
          async function logout() {
            if(confirm('¿Cerrar sesión?')) {
              await fetch('/api/logout', { method: 'POST' });
              window.location.href = '/login';
            }
          }

          // Highlight active menu
          const path = window.location.pathname;
          document.querySelectorAll('.nav-item').forEach(el => {
            if(el.getAttribute('href') === path || (path.startsWith(el.getAttribute('href')) && el.getAttribute('href') !== '/admin')) {
              el.classList.add('active');
            }
          });
        `}} />
      </body>
    </html>
  )
}
