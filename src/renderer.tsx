import { jsxRenderer } from 'hono/jsx-renderer';
import React from "react"

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Más Allá del Miedo - Transforma el miedo en claridad y poder personal</title>
        <meta name="description" content="Herramientas psicológicas para jóvenes: aprende a detectar manipulación, construir límites sanos y liderar tu propia vida con claridad y poder personal." />
        
        {/* Tailwind CSS */}
        <script src="https://cdn.tailwindcss.com"></script>
        
        {/* Font Awesome Icons */}
        <link 
          href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" 
          rel="stylesheet" 
        />
        
        {/* Custom Styles */}
        <link href="/static/style.css" rel="stylesheet" />
        
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        {/* Header/Navigation */}
        <header className="site-header">
          <div className="container">
            <div className="header-content">
              <div className="logo">
                <a href="/">
                  <i className="fas fa-brain" style="font-size: 1.8rem;"></i>
                  <span style="font-weight: 900; letter-spacing: -0.5px;">Más Allá del Miedo</span>
                </a>
              </div>
              
              <nav className="main-nav">
                <a href="/">Inicio</a>
                <a href="/el-libro">El Libro</a>
                <a href="/metodo">Método</a>
                <a href="/recursos-gratuitos">Recursos Gratuitos</a>
                <a href="/cursos">Cursos</a>
                <a href="/comunidad">Comunidad</a>
                <a href="/blog">Blog</a>
                <a href="/sobre-nosotros">Sobre Nosotros</a>
                <a href="/contacto">Contacto</a>
              </nav>

              <div style="display: flex; gap: 10px; align-items: center;">
                <a href="/login" className="btn btn-secondary btn-sm" style="display: none;" id="login-link">
                  <i className="fas fa-sign-in-alt"></i> Iniciar Sesión
                </a>
                <a href="/mi-aprendizaje" className="btn btn-primary btn-sm header-cta" style="display: none;" id="dashboard-link">
                  <i className="fas fa-graduation-cap"></i> Mi Aprendizaje
                </a>
                <a href="/recursos-gratuitos" className="btn btn-primary btn-sm header-cta" id="start-link">
                  Empieza Aquí
                </a>
              </div>

              {/* Mobile Menu Toggle */}
              <button className="mobile-menu-toggle" aria-label="Toggle menu">
                <i className="fas fa-bars"></i>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          {children}
        </main>

        {/* Footer */}
        <footer className="site-footer">
          <div className="container">
            <div className="footer-grid">
              {/* Columna 1: Sobre el Proyecto */}
              <div className="footer-column">
                <h3>
                  <i className="fas fa-brain"></i> Más Allá del Miedo
                </h3>
                <p>
                  Transformando el miedo en claridad, límites y poder personal. 
                  Herramientas psicológicas simples para jóvenes que quieren liderar su propia vida.
                </p>
                <div className="social-links">
                  <a href="#" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
                  <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                  <a href="#" aria-label="Facebook"><i className="fab fa-facebook"></i></a>
                  <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                </div>
              </div>

              {/* Columna 2: Enlaces Rápidos */}
              <div className="footer-column">
                <h4>Enlaces Rápidos</h4>
                <ul>
                  <li><a href="/">Inicio</a></li>
                  <li><a href="/el-libro">El Libro</a></li>
                  <li><a href="/metodo">Método</a></li>
                  <li><a href="/recursos-gratuitos">Recursos Gratuitos</a></li>
                  <li><a href="/cursos">Cursos y Programas</a></li>
                </ul>
              </div>

              {/* Columna 3: Recursos */}
              <div className="footer-column">
                <h4>Recursos</h4>
                <ul>
                  <li><a href="/comunidad">Comunidad</a></li>
                  <li><a href="/blog">Blog y Artículos</a></li>
                  <li><a href="/sobre-nosotros">Sobre Nosotros</a></li>
                  <li><a href="/contacto">Contacto</a></li>
                  <li><a href="/faq">FAQ</a></li>
                </ul>
              </div>

              {/* Columna 4: Legal y Newsletter */}
              <div className="footer-column">
                <h4>Newsletter</h4>
                <p>Recibe contenido exclusivo y recursos gratuitos cada semana</p>
                <form className="footer-newsletter" action="/api/subscribe" method="post">
                  <input type="email" name="email" placeholder="Tu email" required />
                  <button type="submit"><i className="fas fa-paper-plane"></i></button>
                </form>
                <div className="footer-legal">
                  <a href="/privacidad">Privacidad</a>
                  <a href="/terminos">Términos</a>
                </div>
              </div>
            </div>

            <div className="footer-bottom">
              <p>
                &copy; 2024 Más Allá del Miedo. Todos los derechos reservados. 
                Desarrollado con <i className="fas fa-heart"></i> para jóvenes valientes.
              </p>
              <p className="footer-disclaimer">
                Este sitio no sustituye terapia profesional. Si necesitas ayuda urgente, 
                contacta a un profesional de salud mental.
              </p>
            </div>
          </div>
        </footer>

        {/* Floating CTA Button */}
        <a href="/recursos-gratuitos" className="floating-cta" aria-label="Empieza tu ruta">
          <i className="fas fa-gift"></i>
          <span>Empieza Gratis</span>
        </a>

        {/* Scripts */}
        <script src="/static/app.js"></script>
        
        {/* Auth State Script */}
        <script dangerouslySetInnerHTML={{__html: `
          // Verificar estado de autenticación al cargar
          (async function checkAuth() {
            try {
              const response = await fetch('/api/me');
              const data = await response.json();
              
              if (data.success && data.user) {
                // Usuario autenticado
                document.getElementById('login-link')?.remove();
                document.getElementById('start-link')?.remove();
                document.getElementById('dashboard-link').style.display = 'inline-flex';
              } else {
                // Usuario no autenticado
                document.getElementById('dashboard-link')?.remove();
                document.getElementById('login-link').style.display = 'inline-flex';
              }
            } catch (error) {
              // Error o no autenticado
              document.getElementById('dashboard-link')?.remove();
              document.getElementById('login-link').style.display = 'inline-flex';
            }
          })();
        `}} />
      </body>
    </html>
  )
})
