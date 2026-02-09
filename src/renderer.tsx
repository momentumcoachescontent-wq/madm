
import { jsxRenderer } from 'hono/jsx-renderer';
import { Context } from 'hono';
import { html } from 'hono/html';
import { CloudflareBindings } from './types';

export const renderer = jsxRenderer(({ children }, c: Context<{ Bindings: CloudflareBindings }>) => {
  const gaId = c.env?.GA_MEASUREMENT_ID;
  const gaIdRegex = /^(G-[A-Z0-9]+|UA-\d+-\d+)$/;
  const isValidGaId = gaId && gaIdRegex.test(gaId);

  if (gaId && !isValidGaId) {
    console.warn(`Invalid GA_MEASUREMENT_ID: ${gaId}`);
  }

  return (
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        {isValidGaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}></script>
            <script>
              {html`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', '${gaId}');
              `}
            </script>
          </>
        )}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Más Allá del Miedo - Transforma el miedo en claridad y poder personal</title>
        <meta name="description" content="Herramientas psicológicas para jóvenes: aprende a detectar manipulación, construir límites sanos y liderar tu propia vida con claridad y poder personal." />

        {/* Font Awesome Icons */}
        <link
          href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"
          rel="stylesheet"
        />

        {/* Custom Styles */}
        <link href="/static/style.css" rel="stylesheet" />

        {/* Quill Editor Styles */}
        <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet" />

        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@300;400;600;700;900&display=swap" rel="stylesheet" />

        {/* Umbral Chat Styles */}
        <style dangerouslySetInnerHTML={{
          __html: `
          /* Floating Toggle Button */
          .umbral-toggle {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #0f172a 0%, #4c1d95 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.5rem;
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
            cursor: pointer;
            z-index: 9999;
            transition: all 0.3s ease;
            border: 2px solid #8b5cf6;
          }
          .umbral-toggle:hover {
            transform: scale(1.1);
            box-shadow: 0 0 30px rgba(139, 92, 246, 0.8);
          }
          .umbral-toggle i {
            animation: pulse-eye 3s infinite;
          }
          @keyframes pulse-eye {
            0% { opacity: 0.8; }
            50% { opacity: 1; text-shadow: 0 0 10px white; }
            100% { opacity: 0.8; }
          }
          
          /* Chat Window */
          .umbral-window {
            position: fixed;
            bottom: 100px;
            right: 30px;
            width: 380px;
            height: 600px;
            max-height: 80vh;
            background: #0f172a;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            box-shadow: 0 0 40px rgba(0,0,0,0.5);
            z-index: 9999;
            opacity: 0;
            pointer-events: none;
            transform: translateY(20px);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            border: 1px solid #334155;
            font-family: 'Inter', sans-serif;
            overflow: hidden;
          }
          .umbral-window.active {
            opacity: 1;
            pointer-events: all;
            transform: translateY(0);
          }

          /* Chat Header */
          .umbral-header {
            padding: 15px 20px;
            background: #1e293b;
            border-bottom: 1px solid #334155;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .umbral-title {
            font-family: 'Cinzel', serif;
            color: #a78bfa;
            font-weight: 700;
            font-size: 1.1rem;
          }
          .umbral-close {
            background: none;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            font-size: 1.2rem;
            transition: color 0.2s;
          }
          .umbral-close:hover {
            color: white;
          }

          /* Chat Body */
          .umbral-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 15px;
            background: #0f172a;
          }
          .u-message {
            max-width: 85%;
            padding: 10px 15px;
            border-radius: 12px;
            font-size: 0.95rem;
            line-height: 1.5;
            color: #e2e8f0;
            animation: slideIn 0.3s ease;
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .u-message.assistant {
            align-self: flex-start;
            background: #1e293b;
            border-left: 2px solid #8b5cf6;
          }
          .u-message.user {
            align-self: flex-end;
            background: #4c1d95;
            color: white;
            border-bottom-right-radius: 2px;
          }
          .u-typing {
            font-size: 0.8rem;
            color: #64748b;
            font-style: italic;
            text-align: center;
            margin-top: auto;
            display: none;
            padding-bottom: 10px;
          }
          .u-typing.show { display: block; }

          /* Chat Input */
          .umbral-input-area {
            padding: 15px;
            background: #1e293b;
            border-top: 1px solid #334155;
            display: flex;
            gap: 10px;
          }
          .umbral-input {
            flex: 1;
            background: #0f172a;
            border: 1px solid #334155;
            color: white;
            padding: 10px;
            border-radius: 8px;
            resize: none;
            height: 45px;
            font-family: inherit;
          }
          .umbral-input:focus {
            outline: none;
            border-color: #8b5cf6;
          }
          .umbral-send {
            background: #8b5cf6;
            border: none;
            color: white;
            width: 45px;
            height: 45px;
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .umbral-send:hover {
            background: #7c3aed;
          }

          /* Markdown Styles inside chat */
          .u-message p { margin-bottom: 0.5em; }
          .u-message ul { padding-left: 1.2em; list-style: disc; }
          .u-message strong { color: #d8b4fe; font-weight: bold; }
        `}} />
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
      </head>
      <body>
        {/* Header/Navigation */}
        <header className="site-header">
          <div className="container">
            <div className="header-content">
              <div className="logo">
                <a href="/">
                  <i className="fas fa-brain" style={{ fontSize: '1.8rem' }}></i>
                  <span style={{ fontWeight: 900, letterSpacing: '-0.5px' }}>Más Allá del Miedo</span>
                </a>
              </div>

              <nav className="main-nav">
                <a href="/">Inicio</a>
                <a href="/el-libro">El Libro</a>
                <a href="/metodo">Método</a>
                <a href="/recursos-gratuitos">Recursos Gratuitos</a>
                <a href="/cursos">Cursos</a>
                <a href="/comunidad">Comunidad</a>
                <a href="/comparte-tu-historia">Historias</a>
                <a href="/blog">Blog</a>
                <a href="/sobre-nosotros">Sobre Nosotros</a>
                <a href="/contacto">Contacto</a>
                <a href="/admin" id="admin-link" style={{ display: 'none', color: '#8b5cf6', fontWeight: 'bold' }}>Panel</a>
              </nav>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <a href="/login" className="btn btn-secondary btn-sm" style={{ display: 'none' }} id="login-link">
                  <i className="fas fa-sign-in-alt"></i> Iniciar Sesión
                </a>
                <a href="/mi-aprendizaje" className="btn btn-primary btn-sm header-cta" style={{ display: 'none' }} id="dashboard-link">
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

        {/* UMBRAL FLOATING CHAT WIDGET */}
        <div id="umbral-widget-container">
          {/* Toggle Button */}
          <div className="umbral-toggle" id="umbral-toggle" role="button" aria-label="Abrir El Umbral">
            <i className="fas fa-eye"></i>
          </div>

          {/* Chat Window */}
          <div className="umbral-window" id="umbral-window">
            <div className="umbral-header">
              <span className="umbral-title">El Umbral de la Verdad</span>
              <button className="umbral-close" id="umbral-close"><i className="fas fa-times"></i></button>
            </div>

            <div className="umbral-messages" id="umbral-messages">
              <div className="u-message assistant">
                <p>Adelante. Deja tus máscaras en la puerta. ¿Qué verdad vienes a evitar hoy?</p>
              </div>
            </div>

            <div className="u-typing" id="u-typing">El Umbral contempla...</div>

            <div className="umbral-input-area">
              <textarea className="umbral-input" id="umbral-input" placeholder="Escribe tu confesión..."></textarea>
              <button className="umbral-send" id="umbral-send"><i className="fas fa-paper-plane"></i></button>
            </div>
          </div>
        </div>

        {/* Floating CTA Button - Keep this one */}
        <a href="/recursos-gratuitos" className="floating-cta" aria-label="Empieza tu ruta">
          <i className="fas fa-gift"></i>
          <span>Empieza Gratis</span>
        </a>

        {/* Scripts */}
        <script src="/static/app.js"></script>
        {import.meta.env.PROD ? (
          <script type="module" src="/assets/client.js"></script>
        ) : (
          <script type="module" src="/src/client/index.ts"></script>
        )}

        {/* Floating Chat Logic */}
        <script dangerouslySetInnerHTML={{
          __html: `
          (function() {
            // Function to initialize the chat widget ONLY after DOM is fully loaded
            function initUmbral() {
                const toggle = document.getElementById('umbral-toggle');
                const close = document.getElementById('umbral-close');
                const windowEl = document.getElementById('umbral-window');
                const msgs = document.getElementById('umbral-messages');
                const input = document.getElementById('umbral-input');
                const send = document.getElementById('umbral-send');
                const typing = document.getElementById('u-typing');
                
                if (!toggle || !windowEl) return;

                let history = [];
                let isOpen = false;

                function toggleChat() {
                    isOpen = !isOpen;
                    if (isOpen) {
                        windowEl.classList.add('active');
                        toggle.style.opacity = '0'; 
                        setTimeout(() => input.focus(), 300);
                    } else {
                        windowEl.classList.remove('active');
                        toggle.style.opacity = '1';
                    }
                }

                toggle.addEventListener('click', toggleChat);
                close.addEventListener('click', toggleChat);

                async function sendMessage() {
                    const text = input.value.trim();
                    if (!text) return;

                    // Add User Msg
                    addMessage('user', text);
                    input.value = '';
                    typing.classList.add('show');
                    scrollToBottom();

                    const currentTurn = { role: 'user', content: text };
                    
                    try {
                        const res = await fetch('/api/umbral/chat', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ history: [...history, currentTurn] })
                        });
                        
                        if (!res.ok) throw new Error('Error ' + res.status);
                        
                        const data = await res.json();
                        
                        typing.classList.remove('show');
                        addMessage('assistant', data.content);
                        
                        history.push(currentTurn);
                        history.push({ role: 'assistant', content: data.content });
                        
                    } catch (e) {
                        console.error(e);
                        typing.classList.remove('show');
                        addMessage('assistant', '**El Silencio:** Error de conexión. Inténtalo luego.');
                    }
                }

                function addMessage(role, text) {
                    const div = document.createElement('div');
                    div.className = 'u-message ' + role;
                    div.innerHTML = role === 'assistant' && typeof marked !== 'undefined' 
                        ? marked.parse(text) 
                        : text;
                    msgs.appendChild(div);
                    scrollToBottom();
                }

                function scrollToBottom() {
                    msgs.scrollTop = msgs.scrollHeight;
                }

                send.addEventListener('click', sendMessage);
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                    }
                });
            }

            // Run init when DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initUmbral);
            } else {
                initUmbral();
            }
          })();
        `}} />
      </body>
    </html>
  )
})
