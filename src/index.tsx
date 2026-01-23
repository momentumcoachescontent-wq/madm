import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'
import adminApp from './admin'

type Bindings = {
  DB: D1Database
  IMAGES_BUCKET: R2Bucket
  STRIPE_SECRET_KEY: string
  STRIPE_PUBLISHABLE_KEY: string
  STRIPE_WEBHOOK_SECRET: string
  PAYPAL_CLIENT_ID: string
  PAYPAL_CLIENT_SECRET: string
  PAYPAL_MODE: string
  PAYPAL_WEBHOOK_ID: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Habilitar CORS para APIs
app.use('/api/*', cors())

// Mount Admin App (antes del renderer global para tener control propio si necesario,
// pero el admin usa el layout propio, aunque usa c.render que usa el renderer.
// El renderer global se aplica a todo. AdminApp usa adminMiddleware.)
app.route('/admin', adminApp)

// Media Proxy for R2
app.get('/media/:key', async (c) => {
  const key = c.req.param('key')
  const object = await c.env.IMAGES_BUCKET.get(key)

  if (!object) {
    return c.notFound()
  }

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)

  return new Response(object.body, {
    headers,
  })
})

// Aplicar el renderer a todas las páginas
app.use(renderer)

// ===== PÁGINAS =====

// Página de Inicio
app.get('/', (c) => {
  return c.render(
    <div>
      {/* Hero Principal */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Más Allá del Miedo</h1>
            <p className="hero-subtitle">
              Aprende a entender tu mente y proteger tu corazón
            </p>
            <p className="hero-description">
              Herramientas psicológicas simples para que puedas dejar de sobrevivir en piloto automático 
              y empezar a vivir con claridad, límites y poder personal.
            </p>
            <div className="hero-buttons">
              <a href="/recursos-gratuitos" className="btn btn-primary">
                <i className="fas fa-download"></i> Descarga la guía gratuita
              </a>
              <a href="/el-libro" className="btn btn-secondary">
                <i className="fas fa-book"></i> Conoce el libro
              </a>
            </div>
          </div>
          <div className="hero-image">
            <div className="book-mockup">
              <i className="fas fa-book-open fa-10x"></i>
            </div>
          </div>
        </div>
      </section>

      {/* El Problema */}
      <section className="section bg-light">
        <div className="container">
          <h2 className="section-title">¿Te has sentido así?</h2>
          <div className="cards-grid">
            <div className="card">
              <i className="fas fa-heart-broken fa-3x card-icon"></i>
              <h3>Relaciones confusas</h3>
              <p>"No sé si esta relación es sana"</p>
            </div>
            <div className="card">
              <i className="fas fa-exclamation-triangle fa-3x card-icon"></i>
              <h3>Culpa constante</h3>
              <p>"Siento culpa por decir que no"</p>
            </div>
            <div className="card">
              <i className="fas fa-mask fa-3x card-icon"></i>
              <h3>Manipulación invisible</h3>
              <p>"Me manipulan y no me doy cuenta hasta tarde"</p>
            </div>
            <div className="card">
              <i className="fas fa-users fa-3x card-icon"></i>
              <h3>Presión social</h3>
              <p>"Hago cosas que no quiero para encajar"</p>
            </div>
          </div>
        </div>
      </section>

      {/* La Solución */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Tu Ecosistema de Transformación</h2>
          <p className="section-intro">
            Más Allá del Miedo no es solo un libro, es un sistema completo de apoyo emocional
          </p>
          <div className="features-grid">
            <div className="feature">
              <i className="fas fa-book fa-2x"></i>
              <h3>El Libro</h3>
              <p>Historias reales y herramientas prácticas</p>
            </div>
            <div className="feature">
              <i className="fas fa-route fa-2x"></i>
              <h3>Método Probado</h3>
              <p>5 etapas para recuperar tu poder</p>
            </div>
            <div className="feature">
              <i className="fas fa-graduation-cap fa-2x"></i>
              <h3>Cursos Online</h3>
              <p>Aprende a tu ritmo con videos y ejercicios</p>
            </div>
            <div className="feature">
              <i className="fas fa-users-cog fa-2x"></i>
              <h3>Comunidad</h3>
              <p>Espacio seguro de apoyo y crecimiento</p>
            </div>
          </div>
        </div>
      </section>

      {/* El Método en 3 Pasos */}
      <section className="section bg-dark">
        <div className="container">
          <h2 className="section-title text-light">Cómo funciona el método</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Descubre</h3>
              <p>Entiende tu mente, emociones y creencias</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Protege</h3>
              <p>Reconoce manipulación y aprende a poner límites</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Lidera</h3>
              <p>Construye relaciones sanas y toma decisiones conscientes</p>
            </div>
          </div>
          <div className="text-center mt-4">
            <a href="/metodo" className="btn btn-primary">
              <i className="fas fa-compass"></i> Explora el método completo
            </a>
          </div>
        </div>
      </section>

      {/* Destacar el Libro */}
      <section className="section">
        <div className="container">
          <div className="book-showcase">
            <div className="book-showcase-image">
              <i className="fas fa-book fa-8x"></i>
            </div>
            <div className="book-showcase-content">
              <h2>El Libro: Más Allá del Miedo</h2>
              <p className="lead">
                Por <strong>Ernesto Alvarez</strong>
              </p>
              <p>
                Un libro que combina psicología oscura con la alquimia del alma. 
                Sigue las historias de Alex, María, Sam y Sarah mientras aprenden a 
                detectar manipulación, construir límites y liderar sus propias vidas.
              </p>
              <ul className="check-list">
                <li><i className="fas fa-check"></i> Reconocer dinámicas de manipulación emocional</li>
                <li><i className="fas fa-check"></i> Distinguir entre culpa sana y culpa impuesta</li>
                <li><i className="fas fa-check"></i> Usar herramientas psicológicas de forma ética</li>
                <li><i className="fas fa-check"></i> Cuidar tu salud mental en todas tus relaciones</li>
              </ul>
              <a href="/el-libro" className="btn btn-primary">
                <i className="fas fa-arrow-right"></i> Conocer más del libro
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Recursos Gratuitos */}
      <section className="section bg-light">
        <div className="container">
          <h2 className="section-title">Empieza Gratis</h2>
          <p className="section-intro">
            Recursos descargables para comenzar tu transformación hoy
          </p>
          <div className="resources-grid">
            <div className="resource-card">
              <i className="fas fa-file-pdf fa-3x"></i>
              <h3>Test de Autoconocimiento</h3>
              <p>¿Qué tan claros son tus límites emocionales?</p>
              <a href="/recursos-gratuitos" className="btn btn-sm">Descargar</a>
            </div>
            <div className="resource-card">
              <i className="fas fa-exclamation-circle fa-3x"></i>
              <h3>7 Señales de Alerta</h3>
              <p>Identifica relaciones tóxicas antes de que sea tarde</p>
              <a href="/recursos-gratuitos" className="btn btn-sm">Descargar</a>
            </div>
            <div className="resource-card">
              <i className="fas fa-shield-alt fa-3x"></i>
              <h3>Checklist de Límites</h3>
              <p>¿Tus límites son claros o difusos?</p>
              <a href="/recursos-gratuitos" className="btn btn-sm">Descargar</a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="section cta-section">
        <div className="container">
          <h2 className="text-light">No naciste para vivir con miedo</h2>
          <p className="text-light lead">
            Naciste para entenderlo, atravesarlo y crecer
          </p>
          <div className="cta-buttons">
            <a href="/recursos-gratuitos" className="btn btn-light btn-lg">
              <i className="fas fa-gift"></i> Empieza con la guía gratuita
            </a>
            <a href="/contacto" className="btn btn-outline-light btn-lg">
              <i className="fas fa-envelope"></i> Contáctanos
            </a>
          </div>
        </div>
      </section>
    </div>
  )
})

// Página: El Libro
app.get('/el-libro', (c) => {
  return c.render(
    <div>
      <section className="hero hero-small">
        <div className="container">
          <h1>El Libro: Más Allá del Miedo</h1>
          <p className="lead">
            Una historia y una guía práctica para que tomes el control de tu vida emocional
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="book-detail">
            <div className="book-detail-image">
              <i className="fas fa-book fa-10x"></i>
              <p className="author">Por Ernesto Alvarez</p>
            </div>
            <div className="book-detail-content">
              <h2>De qué trata este libro</h2>
              <p>
                <strong>Más Allá del Miedo</strong> es un viaje transformador que combina historias 
                identificables con herramientas psicológicas profundas pero accesibles.
              </p>
              <p>
                Conocerás a cuatro adolescentes: <strong>Alex</strong>, quien supera su miedo a hablar 
                en público; <strong>María</strong>, que aprende a poner límites en situaciones de presión; 
                <strong>Sam</strong> y <strong>Sarah</strong>, quienes navegan relaciones complejas y 
                descubren su verdadero poder interior.
              </p>
              <p>
                Este no es un libro académico pesado. Es una conversación honesta sobre emociones, 
                manipulación, límites y crecimiento personal, escrita en un lenguaje sencillo con 
                ejemplos de la vida real.
              </p>

              <h3 className="mt-4">Qué aprenderás</h3>
              <ul className="check-list">
                <li><i className="fas fa-check"></i> Reconocer dinámicas de manipulación emocional (gaslighting, culpa impuesta, presión de grupo)</li>
                <li><i className="fas fa-check"></i> Distinguir entre culpa sana y culpa tóxica</li>
                <li><i className="fas fa-check"></i> Usar herramientas de "psicología oscura" de forma ética para protegerte</li>
                <li><i className="fas fa-check"></i> Construir límites claros sin sentir culpa</li>
                <li><i className="fas fa-check"></i> Cuidar tu salud mental en relaciones de pareja, familia y amigos</li>
                <li><i className="fas fa-check"></i> Desarrollar inteligencia emocional y autoconciencia profunda</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-light">
        <div className="container">
          <h2 className="section-title">Contenido del Libro</h2>
          <div className="book-chapters">
            <div className="chapter">
              <h3><i className="fas fa-star"></i> Prólogo: Sé Dueño de Tu Poder</h3>
              <p>La revolución silenciosa que está ocurriendo en las mentes de los jóvenes</p>
            </div>
            <div className="chapter">
              <h3><i className="fas fa-compass"></i> Despertar al Héroe Interior</h3>
              <p>Encontrar tu impulso y dirección personal</p>
            </div>
            <div className="chapter">
              <h3><i className="fas fa-mirror"></i> El Espejo de la Verdad</h3>
              <p>Construyendo autoconciencia profunda</p>
            </div>
            <div className="chapter">
              <h3><i className="fas fa-heart"></i> Las Emociones Como Brújula</h3>
              <p>Dominar los sentimientos y la mentalidad</p>
            </div>
            <div className="chapter">
              <h3><i className="fas fa-mask"></i> Psicología Oscura Desenmascarada</h3>
              <p>Reconocimiento de tácticas de manipulación</p>
            </div>
            <div className="chapter">
              <h3><i className="fas fa-shield"></i> Escudarse: Protegerse con Límites</h3>
              <p>Aprende a poner límites sanos y asertivos</p>
            </div>
            <div className="chapter">
              <h3><i className="fas fa-lightbulb"></i> El Poder de la Influencia</h3>
              <p>Usar la psicología para el bien</p>
            </div>
            <div className="chapter">
              <h3><i className="fas fa-users"></i> Liderar con Empatía</h3>
              <p>Influencia, integridad y carácter</p>
            </div>
            <div className="chapter">
              <h3><i className="fas fa-flask"></i> El Laboratorio de Sombras</h3>
              <p>Dominando el arte de la psicología oscura de forma ética</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">¿Para quién es este libro?</h2>
          <div className="two-columns">
            <div className="column">
              <h3 className="text-success"><i className="fas fa-check-circle"></i> Este libro ES para ti si:</h3>
              <ul>
                <li>Eres adolescente o joven adulto navegando relaciones complejas</li>
                <li>Sientes confusión en tus amistades, familia o pareja</li>
                <li>Quieres herramientas prácticas y sencillas, no teoría académica</li>
                <li>Eres padre o educador buscando formas de ayudar a los jóvenes</li>
                <li>Deseas entender cómo funciona la manipulación para protegerte</li>
              </ul>
            </div>
            <div className="column">
              <h3 className="text-danger"><i className="fas fa-times-circle"></i> NO es para ti si:</h3>
              <ul>
                <li>Buscas un manual clínico o técnico de psicología</li>
                <li>Esperas soluciones mágicas instantáneas</li>
                <li>No estás dispuesto a hacer ejercicios de autorreflexión</li>
                <li>Quieres manipular a otros (ese NO es el propósito del libro)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-dark cta-section">
        <div className="container text-center">
          <h2 className="text-light">¿Listo para empezar tu transformación?</h2>
          <p className="text-light lead">Descarga recursos gratuitos o explora nuestros cursos completos</p>
          <div className="cta-buttons">
            <a href="/recursos-gratuitos" className="btn btn-light btn-lg">
              <i className="fas fa-download"></i> Recursos Gratuitos
            </a>
            <a href="/cursos" className="btn btn-outline-light btn-lg">
              <i className="fas fa-graduation-cap"></i> Ver Cursos
            </a>
          </div>
        </div>
      </section>
    </div>
  )
})

// Página: Método
app.get('/metodo', (c) => {
  return c.render(
    <div>
      <section className="hero hero-small bg-gradient">
        <div className="container">
          <h1>Método "Más Allá del Miedo"</h1>
          <p className="lead">
            Un camino estructurado en 5 etapas para transformar el miedo en claridad y poder personal
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="intro-box">
            <h2>No son solo ideas sueltas</h2>
            <p>
              El método "Más Allá del Miedo" es un <strong>sistema completo</strong> que unifica 
              el libro, los cursos, la comunidad y todos nuestros recursos. No importa por dónde 
              empieces, todas las herramientas te guían por el mismo camino probado de transformación.
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-light">
        <div className="container">
          <h2 className="section-title">Las 5 Etapas del Método</h2>
          
          <div className="method-stage">
            <div className="stage-number">1</div>
            <div className="stage-content">
              <h3><i className="fas fa-eye"></i> Conciencia</h3>
              <p className="stage-subtitle">"Ponerle nombre a lo que sientes"</p>
              <p>
                El primer paso es despertar. ¿Qué estás sintiendo realmente? ¿Ansiedad? ¿Culpa? 
                ¿Confusión? Aprendes a identificar tus emociones, reconocer patrones tóxicos y 
                entender las señales que tu cuerpo te envía.
              </p>
              <div className="stage-tools">
                <strong>Herramientas:</strong> Test de autoconocimiento, diario emocional, ejercicios de mindfulness
              </div>
            </div>
          </div>

          <div className="method-stage">
            <div className="stage-number">2</div>
            <div className="stage-content">
              <h3><i className="fas fa-brain"></i> Comprensión</h3>
              <p className="stage-subtitle">"Entender por qué reaccionas así"</p>
              <p>
                Una vez que nombraste la emoción, es momento de comprender su origen. ¿Por qué 
                sientes culpa al decir "no"? ¿De dónde vienen tus miedos? Exploras tus creencias, 
                valores y las voces internas (tuyas y de otros) que guían tus decisiones.
              </p>
              <div className="stage-tools">
                <strong>Herramientas:</strong> Mapa de creencias, análisis de valores, identificación de voces limitantes
              </div>
            </div>
          </div>

          <div className="method-stage">
            <div className="stage-number">3</div>
            <div className="stage-content">
              <h3><i className="fas fa-shield-alt"></i> Protección</h3>
              <p className="stage-subtitle">"Aprender a poner límites y detectar manipulación"</p>
              <p>
                Ahora que te conoces mejor, es hora de protegerte. Aprendes a detectar banderas 
                rojas en relaciones, reconocer tácticas de manipulación (gaslighting, culpa tóxica, 
                presión emocional) y establecer límites claros sin sentir culpa.
              </p>
              <div className="stage-tools">
                <strong>Herramientas:</strong> Checklist de límites, guía de señales de alerta, scripts de comunicación asertiva
              </div>
            </div>
          </div>

          <div className="method-stage">
            <div className="stage-number">4</div>
            <div className="stage-content">
              <h3><i className="fas fa-crown"></i> Liderazgo</h3>
              <p className="stage-subtitle">"Tomar decisiones alineadas con tus valores"</p>
              <p>
                Con tu mente clara y tus límites fuertes, lideras tu propia vida. Tomas decisiones 
                conscientes basadas en tus valores, no en el miedo o la presión externa. Desarrollas 
                confianza genuina y autenticidad en todas tus relaciones.
              </p>
              <div className="stage-tools">
                <strong>Herramientas:</strong> Marco de toma de decisiones, ejercicios de liderazgo personal, práctica de valores
              </div>
            </div>
          </div>

          <div className="method-stage">
            <div className="stage-number">5</div>
            <div className="stage-content">
              <h3><i className="fas fa-rocket"></i> Expansión</h3>
              <p className="stage-subtitle">"Crear relaciones y proyectos desde tu nueva versión"</p>
              <p>
                La transformación no termina en ti. Desde tu nuevo lugar de claridad y poder, 
                construyes relaciones sanas, inspiras a otros y creas proyectos alineados con 
                quien realmente eres. Te conviertes en ejemplo y guía para quienes te rodean.
              </p>
              <div className="stage-tools">
                <strong>Herramientas:</strong> Plan de relaciones conscientes, proyectos de impacto, mentoría entre pares
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Conexión con Nuestros Productos</h2>
          <p className="section-intro">
            Cada etapa del método se trabaja en diferentes formatos según tus necesidades
          </p>
          
          <div className="product-connection">
            <div className="product-item">
              <i className="fas fa-book fa-3x"></i>
              <h3>El Libro</h3>
              <p>
                Recorre las 5 etapas a través de las historias de Alex, María, Sam y Sarah. 
                Incluye ejercicios prácticos al final de cada capítulo.
              </p>
              <p><strong>Cubre:</strong> Todas las etapas (1-5)</p>
            </div>

            <div className="product-item">
              <i className="fas fa-graduation-cap fa-3x"></i>
              <h3>Cursos Online</h3>
              <p>
                Profundiza en etapas específicas con videos, worksheets y ejercicios interactivos. 
                Aprende a tu ritmo con acompañamiento estructurado.
              </p>
              <p><strong>Cubre:</strong> Etapas específicas según el curso elegido</p>
            </div>

            <div className="product-item">
              <i className="fas fa-users fa-3x"></i>
              <h3>Comunidad</h3>
              <p>
                Comparte tu proceso con otros, recibe feedback en tiempo real y participa en 
                retos mensuales para consolidar tu transformación.
              </p>
              <p><strong>Cubre:</strong> Apoyo continuo en todas las etapas</p>
            </div>

            <div className="product-item">
              <i className="fas fa-mobile-alt fa-3x"></i>
              <h3>App (Próximamente)</h3>
              <p>
                Microhábitos diarios, recordatorios personalizados y ejercicios rápidos para 
                mantener tu progreso en el día a día.
              </p>
              <p><strong>Cubre:</strong> Práctica diaria y seguimiento de progreso</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-dark cta-section">
        <div className="container text-center">
          <h2 className="text-light">Elige por dónde quieres empezar tu viaje</h2>
          <div className="cta-buttons">
            <a href="/el-libro" className="btn btn-light btn-lg">
              <i className="fas fa-book"></i> Ver el Libro
            </a>
            <a href="/cursos" className="btn btn-outline-light btn-lg">
              <i className="fas fa-graduation-cap"></i> Explorar Cursos
            </a>
            <a href="/recursos-gratuitos" className="btn btn-outline-light btn-lg">
              <i className="fas fa-gift"></i> Recursos Gratuitos
            </a>
          </div>
        </div>
      </section>
    </div>
  )
})

// Página: Recursos Gratuitos
app.get('/recursos-gratuitos', (c) => {
  return c.render(
    <div>
      <section className="hero hero-small">
        <div className="container">
          <h1>Recursos Gratuitos</h1>
          <p className="lead">
            Empieza a ir más allá del miedo incluso si hoy no puedes invertir dinero
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="intro-box">
            <p>
              Creemos que todos merecen acceso a herramientas de crecimiento emocional. 
              Por eso hemos creado estos recursos 100% gratuitos para que comiences tu 
              transformación hoy mismo.
            </p>
          </div>

          <div className="resources-list">
            <div className="resource-detail-card">
              <div className="resource-icon">
                <i className="fas fa-clipboard-check fa-4x"></i>
              </div>
              <div className="resource-content">
                <h3>Test: ¿Qué tan claros son tus límites emocionales?</h3>
                <p className="resource-type">
                  <span className="badge">PDF Interactivo</span>
                  <span className="badge">10 minutos</span>
                </p>
                <p>
                  Un test de 20 preguntas que te ayuda a descubrir si tus límites son claros 
                  y firmes o si necesitas fortalecerlos. Incluye interpretación de resultados 
                  y primeros pasos de acción.
                </p>
                <form action="/api/subscribe" method="post" className="subscribe-form">
                  <input type="hidden" name="resource" value="test-limites" />
                  <input type="text" name="name" placeholder="Tu nombre" required />
                  <input type="email" name="email" placeholder="Tu email" required />
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-download"></i> Descargar Test
                  </button>
                </form>
              </div>
            </div>

            <div className="resource-detail-card">
              <div className="resource-icon">
                <i className="fas fa-exclamation-triangle fa-4x"></i>
              </div>
              <div className="resource-content">
                <h3>Guía: 7 Señales de Alerta en una Relación</h3>
                <p className="resource-type">
                  <span className="badge">PDF</span>
                  <span className="badge">8 páginas</span>
                </p>
                <p>
                  Aprende a identificar banderas rojas en relaciones de pareja, amistades y 
                  familiares. Cada señal incluye ejemplos concretos y qué hacer al respecto.
                </p>
                <form action="/api/subscribe" method="post" className="subscribe-form">
                  <input type="hidden" name="resource" value="7-senales" />
                  <input type="text" name="name" placeholder="Tu nombre" required />
                  <input type="email" name="email" placeholder="Tu email" required />
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-download"></i> Descargar Guía
                  </button>
                </form>
              </div>
            </div>

            <div className="resource-detail-card">
              <div className="resource-icon">
                <i className="fas fa-list-check fa-4x"></i>
              </div>
              <div className="resource-content">
                <h3>Checklist: ¿Tus límites son claros o difusos?</h3>
                <p className="resource-type">
                  <span className="badge">PDF Imprimible</span>
                  <span className="badge">5 minutos</span>
                </p>
                <p>
                  Una checklist rápida para evaluar la salud de tus límites en diferentes áreas: 
                  familia, amigos, pareja, trabajo/escuela y contigo mismo.
                </p>
                <form action="/api/subscribe" method="post" className="subscribe-form">
                  <input type="hidden" name="resource" value="checklist-limites" />
                  <input type="text" name="name" placeholder="Tu nombre" required />
                  <input type="email" name="email" placeholder="Tu email" required />
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-download"></i> Descargar Checklist
                  </button>
                </form>
              </div>
            </div>

            <div className="resource-detail-card">
              <div className="resource-icon">
                <i className="fas fa-wind fa-4x"></i>
              </div>
              <div className="resource-content">
                <h3>Audio: Ejercicio de Respiración para el Miedo</h3>
                <p className="resource-type">
                  <span className="badge">Audio MP3</span>
                  <span className="badge">5 minutos</span>
                </p>
                <p>
                  Audio guiado para cuando el miedo, la ansiedad o el pánico se disparan. 
                  Técnica de respiración 4-7-8 con visualización de anclaje emocional.
                </p>
                <form action="/api/subscribe" method="post" className="subscribe-form">
                  <input type="hidden" name="resource" value="audio-respiracion" />
                  <input type="text" name="name" placeholder="Tu nombre" required />
                  <input type="email" name="email" placeholder="Tu email" required />
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-download"></i> Descargar Audio
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-light">
        <div className="container text-center">
          <h2>¿Quieres ir más profundo?</h2>
          <p className="lead">
            Cuando estés listo para dar el siguiente paso, explora nuestros cursos completos 
            o adquiere el libro para una transformación guiada.
          </p>
          <div className="cta-buttons">
            <a href="/cursos" className="btn btn-primary btn-lg">
              <i className="fas fa-graduation-cap"></i> Ver Cursos
            </a>
            <a href="/el-libro" className="btn btn-secondary btn-lg">
              <i className="fas fa-book"></i> Conocer el Libro
            </a>
          </div>
        </div>
      </section>
    </div>
  )
})

// Página: Contacto
app.get('/contacto', (c) => {
  return c.render(
    <div>
      <section className="hero hero-small">
        <div className="container">
          <h1>Contacto y Soporte</h1>
          <p className="lead">
            ¿Tienes dudas o necesitas ayuda? Estamos aquí para ti
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>Formas de Contactarnos</h2>
              <div className="contact-method">
                <i className="fas fa-envelope fa-2x"></i>
                <div>
                  <h3>Email de Soporte</h3>
                  <p><a href="mailto:soporte@masalladelmie do.com">soporte@masalladelmiedo.com</a></p>
                  <p className="text-small">Respuesta en 24-48 horas</p>
                </div>
              </div>

              <div className="contact-method">
                <i className="fas fa-comments fa-2x"></i>
                <div>
                  <h3>Comunidad</h3>
                  <p>Únete a nuestro grupo privado para apoyo entre pares</p>
                  <a href="/comunidad" className="btn btn-sm">Ver Comunidad</a>
                </div>
              </div>

              <div className="contact-method">
                <i className="fab fa-youtube fa-2x"></i>
                <div>
                  <h3>YouTube</h3>
                  <p>Videos semanales sobre psicología emocional</p>
                  <a href="#" className="btn btn-sm">Suscribirse</a>
                </div>
              </div>

              <div className="contact-method">
                <i className="fab fa-instagram fa-2x"></i>
                <div>
                  <h3>Redes Sociales</h3>
                  <p>Síguenos para contenido diario y tips rápidos</p>
                </div>
              </div>
            </div>

            <div className="contact-form-container">
              <h2>Envíanos un Mensaje</h2>
              <form action="/api/contact" method="post" className="contact-form">
                <div className="form-group">
                  <label for="name">Nombre completo *</label>
                  <input type="text" id="name" name="name" required />
                </div>

                <div className="form-group">
                  <label for="email">Email *</label>
                  <input type="email" id="email" name="email" required />
                </div>

                <div className="form-group">
                  <label for="subject">Asunto</label>
                  <select id="subject" name="subject">
                    <option value="general">Consulta General</option>
                    <option value="soporte-tecnico">Soporte Técnico</option>
                    <option value="cursos">Dudas sobre Cursos</option>
                    <option value="libro">Información del Libro</option>
                    <option value="colaboracion">Propuesta de Colaboración</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label for="message">Mensaje *</label>
                  <textarea id="message" name="message" rows="6" required></textarea>
                </div>

                <button type="submit" className="btn btn-primary btn-block">
                  <i className="fas fa-paper-plane"></i> Enviar Mensaje
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-light">
        <div className="container">
          <h2 className="section-title">Preguntas Frecuentes</h2>
          <div className="faq-list">
            <div className="faq-item">
              <h3><i className="fas fa-question-circle"></i> ¿Qué pasa si no me gusta el curso?</h3>
              <p>
                Ofrecemos garantía de satisfacción de 30 días. Si el curso no cumple tus 
                expectativas, te devolvemos el 100% de tu dinero sin preguntas.
              </p>
            </div>

            <div className="faq-item">
              <h3><i className="fas fa-question-circle"></i> ¿Puedo usar el contenido con mis alumnos/hijos?</h3>
              <p>
                ¡Por supuesto! El contenido está diseñado para ser compartido. Si eres educador 
                o padre, contáctanos para opciones especiales de licencias grupales.
              </p>
            </div>

            <div className="faq-item">
              <h3><i className="fas fa-question-circle"></i> ¿Necesito conocimientos previos de psicología?</h3>
              <p>
                No. Todo está explicado en lenguaje simple y accesible. Si puedes leer y 
                reflexionar sobre tu vida, puedes aprovechar estos recursos.
              </p>
            </div>

            <div className="faq-item">
              <h3><i className="fas fa-question-circle"></i> ¿Este contenido reemplaza terapia profesional?</h3>
              <p>
                No. Nuestro contenido es educativo y de acompañamiento, pero no sustituye 
                el trabajo con un profesional de salud mental si lo necesitas.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
})

// Página: Comunidad
app.get('/comunidad', (c) => {
  return c.render(
    <div>
      <section className="hero hero-small">
        <div className="container">
          <h1>Comunidad</h1>
          <p className="lead">Un espacio seguro para crecer juntos</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="content-section" style="max-width: 900px; margin: 0 auto;">
            <h2 style="text-align: center; margin-bottom: 20px;">
              <i className="fas fa-users-cog"></i> Únete a Nuestra Comunidad
            </h2>
            <p className="text-center" style="font-size: 1.1rem; color: #64748b; margin-bottom: 50px;">
              No estás solo en este camino. Miles de jóvenes como tú están aprendiendo a liderar su propia vida.
            </p>

            <div className="features-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin-bottom: 60px;">
              <div className="feature-card" style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center;">
                <i className="fas fa-comments fa-3x" style="color: #8b5cf6; margin-bottom: 20px;"></i>
                <h3 style="color: #1e293b; margin-bottom: 15px;">Conversaciones Profundas</h3>
                <p style="color: #64748b;">
                  Comparte tus experiencias, dudas y aprendizajes en un espacio libre de juicio.
                </p>
              </div>

              <div className="feature-card" style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center;">
                <i className="fas fa-hands-helping fa-3x" style="color: #10b981; margin-bottom: 20px;"></i>
                <h3 style="color: #1e293b; margin-bottom: 15px;">Apoyo Mutuo</h3>
                <p style="color: #64748b;">
                  Aprende de otros que están pasando por situaciones similares y ofrece tu perspectiva.
                </p>
              </div>

              <div className="feature-card" style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center;">
                <i className="fas fa-calendar-check fa-3x" style="color: #f59e0b; margin-bottom: 20px;"></i>
                <h3 style="color: #1e293b; margin-bottom: 15px;">Eventos en Vivo</h3>
                <p style="color: #64748b;">
                  Sesiones de Q&A, talleres y encuentros con expertos en psicología emocional.
                </p>
              </div>
            </div>

            <div className="cta-box" style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 50px; border-radius: 16px; text-align: center; color: white; margin-bottom: 60px;">
              <h2 style="color: white; margin-bottom: 15px;">
                <i className="fab fa-discord"></i> Únete a Nuestro Discord
              </h2>
              <p style="font-size: 1.1rem; margin-bottom: 30px; opacity: 0.95;">
                Únete a nuestra comunidad. Contamos con una sección abierta para todos y áreas privadas exclusivas para estudiantes.
              </p>
              <a href="https://discord.gg/FWANA7Gz" target="_blank" rel="noopener noreferrer" className="btn btn-light btn-lg" style="background: white; color: #8b5cf6;">
                <i className="fab fa-discord"></i> Unirme a la Comunidad
              </a>
            </div>

            <h2 style="text-align: center; margin-bottom: 40px;">
              Reglas de la Comunidad
            </h2>
            <div className="rules-grid" style="display: grid; gap: 20px; margin-bottom: 40px;">
              <div className="rule-item" style="display: flex; gap: 20px; padding: 20px; background: #f8fafc; border-radius: 10px;">
                <div style="flex-shrink: 0;">
                  <div style="width: 50px; height: 50px; border-radius: 50%; background: #e0e7ff; display: flex; align-items: center; justify-content: center;">
                    <i className="fas fa-heart" style="color: #8b5cf6; font-size: 1.3rem;"></i>
                  </div>
                </div>
                <div>
                  <h4 style="color: #1e293b; margin-bottom: 8px;">Respeto y Empatía</h4>
                  <p style="color: #64748b; margin: 0;">
                    Tratamos a todos con respeto. Cada persona está en su propio proceso.
                  </p>
                </div>
              </div>

              <div className="rule-item" style="display: flex; gap: 20px; padding: 20px; background: #f8fafc; border-radius: 10px;">
                <div style="flex-shrink: 0;">
                  <div style="width: 50px; height: 50px; border-radius: 50%; background: #dcfce7; display: flex; align-items: center; justify-content: center;">
                    <i className="fas fa-user-shield" style="color: #10b981; font-size: 1.3rem;"></i>
                  </div>
                </div>
                <div>
                  <h4 style="color: #1e293b; margin-bottom: 8px;">Confidencialidad</h4>
                  <p style="color: #64748b; margin: 0;">
                    Lo que se comparte en la comunidad, se queda en la comunidad.
                  </p>
                </div>
              </div>

              <div className="rule-item" style="display: flex; gap: 20px; padding: 20px; background: #f8fafc; border-radius: 10px;">
                <div style="flex-shrink: 0;">
                  <div style="width: 50px; height: 50px; border-radius: 50%; background: #fef3c7; display: flex; align-items: center; justify-content: center;">
                    <i className="fas fa-ban" style="color: #f59e0b; font-size: 1.3rem;"></i>
                  </div>
                </div>
                <div>
                  <h4 style="color: #1e293b; margin-bottom: 8px;">Cero Tolerancia</h4>
                  <p style="color: #64748b; margin: 0;">
                    No se permite bullying, discriminación, spam ni contenido inapropiado.
                  </p>
                </div>
              </div>

              <div className="rule-item" style="display: flex; gap: 20px; padding: 20px; background: #f8fafc; border-radius: 10px;">
                <div style="flex-shrink: 0;">
                  <div style="width: 50px; height: 50px; border-radius: 50%; background: #fce7f3; display: flex; align-items: center; justify-content: center;">
                    <i className="fas fa-question-circle" style="color: #ec4899; font-size: 1.3rem;"></i>
                  </div>
                </div>
                <div>
                  <h4 style="color: #1e293b; margin-bottom: 8px;">Pide Ayuda Profesional</h4>
                  <p style="color: #64748b; margin: 0;">
                    Si estás en crisis, contacta a un profesional de salud mental. No somos terapeutas.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p style="color: #64748b; margin-bottom: 20px;">
                <strong>Nota:</strong> Algunas secciones son exclusivas para estudiantes que han adquirido el libro o algún curso.
              </p>
              <a href="/recursos-gratuitos" className="btn btn-secondary">
                <i className="fas fa-gift"></i> Empezar con Recursos Gratuitos
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
})

// Página: Sobre Nosotros
app.get('/sobre-nosotros', (c) => {
  return c.render(
    <div>
      <section className="hero hero-small">
        <div className="container">
          <h1>Sobre Nosotros</h1>
          <p className="lead">La historia detrás de "Más Allá del Miedo"</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="about-content" style="max-width: 900px; margin: 0 auto;">
            <div className="author-section" style="display: grid; grid-template-columns: 200px 1fr; gap: 40px; align-items: center; margin-bottom: 60px; padding: 40px; background: white; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
              <div className="author-image" style="text-align: center;">
                <div style="width: 180px; height: 180px; border-radius: 50%; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                  <i className="fas fa-user fa-5x" style="color: white;"></i>
                </div>
              </div>
              <div>
                <h2 style="color: #1e293b; margin-bottom: 15px;">Ernesto Alvarez</h2>
                <p style="color: #8b5cf6; font-weight: 600; font-size: 1.1rem; margin-bottom: 15px;">
                  Autor, Educador y Guía de Transformación Personal
                </p>
                <p style="color: #64748b; line-height: 1.8; margin-bottom: 15px;">
                  Ernesto es un apasionado por ayudar a los jóvenes a entender su mente y proteger su corazón. 
                  Con años de experiencia en psicología emocional y desarrollo personal, ha ayudado a miles 
                  de personas a liberarse de relaciones tóxicas y construir vidas con propósito.
                </p>
                <p style="color: #64748b; line-height: 1.8;">
                  Su enfoque combina psicología moderna con herramientas prácticas, creando un método 
                  accesible para que cualquier persona pueda comenzar su transformación.
                </p>
              </div>
            </div>

            <h2 style="text-align: center; margin-bottom: 30px;">
              Nuestra Misión
            </h2>
            <div className="mission-box" style="background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%); padding: 40px; border-radius: 16px; margin-bottom: 60px; text-align: center;">
              <p style="font-size: 1.3rem; line-height: 1.9; color: #1e293b; margin: 0; font-weight: 500;">
                "Empoderar a la próxima generación con herramientas psicológicas simples para que puedan 
                detectar manipulación, construir límites sanos y liderar sus propias vidas con claridad y poder personal."
              </p>
            </div>

            <h2 style="text-align: center; margin-bottom: 40px;">
              Por Qué Hacemos Esto
            </h2>
            <div className="story-grid" style="display: grid; gap: 30px; margin-bottom: 60px;">
              <div style="padding: 30px; background: white; border-left: 4px solid #8b5cf6; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                <h3 style="color: #1e293b; margin-bottom: 15px;">
                  <i className="fas fa-lightbulb" style="color: #f59e0b;"></i> El Problema
                </h3>
                <p style="color: #64748b; line-height: 1.8; margin: 0;">
                  Demasiados jóvenes están atrapados en relaciones tóxicas, no saben poner límites y sienten 
                  culpa constante. Muchos no tienen acceso a terapia y necesitan herramientas prácticas ahora.
                </p>
              </div>

              <div style="padding: 30px; background: white; border-left: 4px solid #10b981; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                <h3 style="color: #1e293b; margin-bottom: 15px;">
                  <i className="fas fa-heart" style="color: #ec4899;"></i> Nuestra Solución
                </h3>
                <p style="color: #64748b; line-height: 1.8; margin: 0;">
                  Creamos un ecosistema completo: libro accesible, recursos gratuitos, cursos online y comunidad 
                  de apoyo. Todo diseñado para que puedas empezar hoy mismo tu transformación.
                </p>
              </div>

              <div style="padding: 30px; background: white; border-left: 4px solid #ec4899; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                <h3 style="color: #1e293b; margin-bottom: 15px;">
                  <i className="fas fa-rocket" style="color: #8b5cf6;"></i> Nuestro Impacto
                </h3>
                <p style="color: #64748b; line-height: 1.8; margin: 0;">
                  Miles de jóvenes ya han transformado sus vidas: han salido de relaciones tóxicas, han 
                  aprendido a poner límites y están construyendo el futuro que merecen.
                </p>
              </div>
            </div>

            <h2 style="text-align: center; margin-bottom: 40px;">
              Nuestros Valores
            </h2>
            <div className="values-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; margin-bottom: 60px;">
              <div style="text-align: center; padding: 30px;">
                <i className="fas fa-shield-alt fa-3x" style="color: #8b5cf6; margin-bottom: 20px;"></i>
                <h3 style="color: #1e293b; margin-bottom: 10px;">Protección</h3>
                <p style="color: #64748b;">
                  Tu bienestar emocional es nuestra prioridad. Nunca promovemos manipulación dañina.
                </p>
              </div>

              <div style="text-align: center; padding: 30px;">
                <i className="fas fa-hand-holding-heart fa-3x" style="color: #10b981; margin-bottom: 20px;"></i>
                <h3 style="color: #1e293b; margin-bottom: 10px;">Empatía</h3>
                <p style="color: #64748b;">
                  Entendemos que cada persona tiene su propio proceso y ritmo de crecimiento.
                </p>
              </div>

              <div style="text-align: center; padding: 30px;">
                <i className="fas fa-book-open fa-3x" style="color: #f59e0b; margin-bottom: 20px;"></i>
                <h3 style="color: #1e293b; margin-bottom: 10px;">Educación</h3>
                <p style="color: #64748b;">
                  Creemos que el conocimiento es poder cuando se usa éticamente.
                </p>
              </div>

              <div style="text-align: center; padding: 30px;">
                <i className="fas fa-users fa-3x" style="color: #ec4899; margin-bottom: 20px;"></i>
                <h3 style="color: #1e293b; margin-bottom: 10px;">Comunidad</h3>
                <p style="color: #64748b;">
                  Juntos somos más fuertes. Creamos espacios seguros para crecer.
                </p>
              </div>
            </div>

            <div className="cta-section" style="text-align: center; padding: 50px; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); border-radius: 16px; color: white;">
              <h2 style="color: white; margin-bottom: 20px;">¿Listo para Unirte?</h2>
              <p style="font-size: 1.1rem; margin-bottom: 30px; opacity: 0.95;">
                Comienza tu transformación hoy con nuestros recursos gratuitos
              </p>
              <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <a href="/recursos-gratuitos" className="btn btn-light btn-lg">
                  <i className="fas fa-gift"></i> Recursos Gratuitos
                </a>
                <a href="/contacto" className="btn btn-outline-light btn-lg" style="border: 2px solid white; color: white;">
                  <i className="fas fa-envelope"></i> Contáctanos
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
})

// Página: Login
app.get('/login', (c) => {
  return c.render(
    <div>
      <section className="hero hero-small">
        <div className="container">
          <h1>Iniciar Sesión</h1>
          <p className="lead">Accede a tus cursos y continúa aprendiendo</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="auth-container">
            <div className="auth-form-card">
              <h2>Bienvenido de Vuelta</h2>
              <p className="text-center" style="margin-bottom: 30px; color: #64748b;">
                Ingresa tus credenciales para continuar
              </p>

              <div id="auth-message" className="auth-message" style="display: none;"></div>

              <form id="login-form" className="auth-form">
                <div className="form-group">
                  <label for="email">Email *</label>
                  <input type="email" id="email" name="email" required placeholder="tu@email.com" />
                </div>

                <div className="form-group">
                  <label for="password">Contraseña *</label>
                  <input type="password" id="password" name="password" required placeholder="••••••••" />
                </div>

                <button type="submit" className="btn btn-primary btn-block btn-lg">
                  <i className="fas fa-sign-in-alt"></i> Iniciar Sesión
                </button>
              </form>

              <div className="auth-footer">
                <p>¿No tienes cuenta? <a href="/registro">Regístrate aquí</a></p>
                <p><a href="/recuperar-password">¿Olvidaste tu contraseña?</a></p>
              </div>

              <div className="auth-demo">
                <p style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 0.9rem;">
                  <strong>Usuario Demo:</strong> demo@masalladelmiedo.com<br/>
                  <strong>Contraseña:</strong> demo123
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <script dangerouslySetInnerHTML={{__html: `
        document.getElementById('login-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const messageDiv = document.getElementById('auth-message');
          const submitBtn = e.target.querySelector('button[type="submit"]');
          const originalBtnText = submitBtn.innerHTML;
          
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
          messageDiv.style.display = 'none';
          
          const formData = new FormData(e.target);
          
          try {
            const response = await fetch('/api/login', {
              method: 'POST',
              body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
              messageDiv.className = 'auth-message success';
              messageDiv.textContent = '¡Bienvenido! Redirigiendo...';
              messageDiv.style.display = 'block';
              
              setTimeout(() => {
                window.location.href = '/mi-aprendizaje';
              }, 1000);
            } else {
              throw new Error(data.error || 'Error al iniciar sesión');
            }
          } catch (error) {
            messageDiv.className = 'auth-message error';
            messageDiv.textContent = error.message;
            messageDiv.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }
        });
      `}} />
    </div>
  )
})

// Página: Registro
app.get('/registro', (c) => {
  return c.render(
    <div>
      <section className="hero hero-small">
        <div className="container">
          <h1>Crear Cuenta</h1>
          <p className="lead">Únete a nuestra comunidad y comienza tu transformación</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="auth-container">
            <div className="auth-form-card">
              <h2>Crea tu Cuenta Gratuita</h2>
              <p className="text-center" style="margin-bottom: 30px; color: #64748b;">
                Completa tus datos para empezar
              </p>

              <div id="auth-message" className="auth-message" style="display: none;"></div>

              <form id="register-form" className="auth-form">
                <div className="form-group">
                  <label for="name">Nombre completo *</label>
                  <input type="text" id="name" name="name" required placeholder="Juan Pérez" />
                </div>

                <div className="form-group">
                  <label for="email">Email *</label>
                  <input type="email" id="email" name="email" required placeholder="tu@email.com" />
                </div>

                <div className="form-group">
                  <label for="password">Contraseña * (mínimo 6 caracteres)</label>
                  <input type="password" id="password" name="password" required placeholder="••••••••" minlength="6" />
                </div>

                <div className="form-group">
                  <label for="password_confirm">Confirmar contraseña *</label>
                  <input type="password" id="password_confirm" name="password_confirm" required placeholder="••••••••" minlength="6" />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input type="checkbox" required />
                    <span>
                      Acepto los <a href="/terminos" target="_blank">Términos y Condiciones</a> 
                      y la <a href="/privacidad" target="_blank">Política de Privacidad</a>
                    </span>
                  </label>
                </div>

                <button type="submit" className="btn btn-primary btn-block btn-lg">
                  <i className="fas fa-user-plus"></i> Crear Cuenta
                </button>
              </form>

              <div className="auth-footer">
                <p>¿Ya tienes cuenta? <a href="/login">Inicia sesión aquí</a></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <script dangerouslySetInnerHTML={{__html: `
        document.getElementById('register-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const messageDiv = document.getElementById('auth-message');
          const submitBtn = e.target.querySelector('button[type="submit"]');
          const originalBtnText = submitBtn.innerHTML;
          
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando cuenta...';
          messageDiv.style.display = 'none';
          
          const formData = new FormData(e.target);
          
          try {
            const response = await fetch('/api/register', {
              method: 'POST',
              body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
              messageDiv.className = 'auth-message success';
              messageDiv.textContent = '¡Cuenta creada! Redirigiendo...';
              messageDiv.style.display = 'block';
              
              setTimeout(() => {
                window.location.href = '/mi-aprendizaje';
              }, 1000);
            } else {
              throw new Error(data.error || 'Error al crear cuenta');
            }
          } catch (error) {
            messageDiv.className = 'auth-message error';
            messageDiv.textContent = error.message;
            messageDiv.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }
        });
      `}} />
    </div>
  )
})

// ===== API ENDPOINTS =====

// API: Guardar contacto en base de datos
app.post('/api/contact', async (c) => {
  try {
    const body = await c.req.parseBody()
    const { name, email, subject, message } = body

    // Validación básica
    if (!name || !email || !message) {
      return c.json({ error: 'Faltan campos requeridos' }, 400)
    }

    // Guardar en base de datos D1
    const result = await c.env.DB.prepare(`
      INSERT INTO contacts (name, email, subject, message)
      VALUES (?, ?, ?, ?)
    `).bind(name, email, subject || 'General', message).run()

    return c.json({ 
      success: true, 
      message: 'Mensaje enviado correctamente. Te responderemos pronto.' 
    })
  } catch (error) {
    console.error('Error al guardar contacto:', error)
    return c.json({ error: 'Error al enviar mensaje' }, 500)
  }
})

// API: Suscripción a recursos gratuitos
app.post('/api/subscribe', async (c) => {
  try {
    const body = await c.req.parseBody()
    const { name, email, resource } = body

    if (!name || !email) {
      return c.json({ error: 'Nombre y email son requeridos' }, 400)
    }

    // Intentar insertar o actualizar suscriptor
    await c.env.DB.prepare(`
      INSERT INTO subscribers (name, email, resource_requested)
      VALUES (?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        resource_requested = excluded.resource_requested
    `).bind(name, email, resource || 'general').run()

    // Mapa de recursos disponibles
    const resources: Record<string, string> = {
      'test-limites': '/downloads/test-limites.pdf',
      '7-senales': '/downloads/7-senales.pdf',
      'checklist-limites': '/downloads/checklist-limites.pdf',
      'audio-respiracion': '/downloads/audio-respiracion.mp3'
    }

    const downloadUrl = resource && typeof resource === 'string' ? resources[resource] : null

    return c.json({ 
      success: true,
      message: 'Gracias por suscribirte. Recibirás el recurso en tu email.',
      downloadUrl
    })
  } catch (error) {
    console.error('Error al guardar suscriptor:', error)
    return c.json({ error: 'Error al procesar suscripción' }, 500)
  }
})

// ===== AUTENTICACIÓN APIS =====

// API: Registro de usuario
app.post('/api/register', async (c) => {
  try {
    const body = await c.req.parseBody()
    const { name, email, password, password_confirm } = body

    // Validaciones
    if (!name || !email || !password) {
      return c.json({ error: 'Todos los campos son requeridos' }, 400)
    }

    if (password !== password_confirm) {
      return c.json({ error: 'Las contraseñas no coinciden' }, 400)
    }

    if ((password as string).length < 6) {
      return c.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, 400)
    }

    // Verificar si el email ya existe
    const existingUser = await c.env.DB.prepare(`
      SELECT id FROM users WHERE email = ?
    `).bind(email).first()

    if (existingUser) {
      return c.json({ error: 'Este email ya está registrado' }, 400)
    }

    // Importar funciones de auth
    const { hashPassword, createSession } = await import('./auth-utils')
    
    // Hashear contraseña
    const passwordHash = await hashPassword(password as string)

    // Crear usuario
    const result = await c.env.DB.prepare(`
      INSERT INTO users (name, email, password_hash, role, active, email_verified)
      VALUES (?, ?, ?, 'student', 1, 0)
    `).bind(name, email, passwordHash).run()

    const userId = result.meta.last_row_id

    // Crear sesión
    const sessionToken = await createSession(c.env.DB, userId)

    // Establecer cookie de sesión
    c.header('Set-Cookie', `session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`)

    return c.json({ 
      success: true,
      message: 'Registro exitoso',
      user: {
        id: userId,
        name,
        email
      }
    })
  } catch (error) {
    console.error('Error en registro:', error)
    return c.json({ error: 'Error al crear cuenta' }, 500)
  }
})

// API: Login de usuario
app.post('/api/login', async (c) => {
  try {
    const body = await c.req.parseBody()
    const { email, password } = body

    if (!email || !password) {
      return c.json({ error: 'Email y contraseña requeridos' }, 400)
    }

    // Buscar usuario
    const user = await c.env.DB.prepare(`
      SELECT id, email, name, password_hash, role, active 
      FROM users 
      WHERE email = ?
    `).bind(email).first()

    if (!user || !user.active) {
      return c.json({ error: 'Credenciales inválidas' }, 401)
    }

    // Verificar contraseña
    const { verifyPassword, createSession } = await import('./auth-utils')
    const isValid = await verifyPassword(password as string, user.password_hash as string)

    if (!isValid) {
      return c.json({ error: 'Credenciales inválidas' }, 401)
    }

    // Crear sesión
    const sessionToken = await createSession(c.env.DB, user.id as number)

    // Establecer cookie
    c.header('Set-Cookie', `session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`)

    return c.json({ 
      success: true,
      message: 'Login exitoso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Error en login:', error)
    return c.json({ error: 'Error al iniciar sesión' }, 500)
  }
})

// API: Logout de usuario
app.post('/api/logout', async (c) => {
  try {
    // Obtener token de cookie
    const cookies = c.req.header('Cookie')
    const sessionToken = cookies?.split(';').find(c => c.trim().startsWith('session='))?.split('=')[1]

    if (sessionToken) {
      // Eliminar sesión de base de datos
      await c.env.DB.prepare(`
        DELETE FROM user_sessions WHERE session_token = ?
      `).bind(sessionToken).run()
    }

    // Borrar cookie
    c.header('Set-Cookie', 'session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0')

    return c.json({ success: true, message: 'Sesión cerrada' })
  } catch (error) {
    console.error('Error en logout:', error)
    return c.json({ error: 'Error al cerrar sesión' }, 500)
  }
})

// API: Verificar sesión actual
app.get('/api/me', async (c) => {
  try {
    // Obtener token de cookie
    const cookies = c.req.header('Cookie')
    const sessionToken = cookies?.split(';').find(c => c.trim().startsWith('session='))?.split('=')[1]

    if (!sessionToken) {
      return c.json({ error: 'No autenticado' }, 401)
    }

    // Obtener usuario de sesión
    const { getUserFromSession } = await import('./auth-utils')
    const user = await getUserFromSession(c.env.DB, sessionToken)

    if (!user) {
      return c.json({ error: 'Sesión inválida o expirada' }, 401)
    }

    return c.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Error verificando sesión:', error)
    return c.json({ error: 'Error al verificar sesión' }, 500)
  }
})

// ===== APIs DE PAGOS =====

// API: Crear Payment Intent de Stripe
app.post('/api/create-payment-intent', async (c) => {
  try {
    const { getCurrentUser } = await import('./auth-utils')
    const user = await getCurrentUser(c)

    if (!user) {
      return c.json({ error: 'No autenticado' }, 401)
    }

    const body = await c.req.json()
    const { courseId } = body

    // Obtener información del curso
    const course = await c.env.DB.prepare(`
      SELECT id, title, price, currency FROM courses WHERE id = ? AND published = 1
    `).bind(courseId).first()

    if (!course) {
      return c.json({ error: 'Curso no encontrado' }, 404)
    }

    // Verificar si ya está inscrito
    const enrollment = await c.env.DB.prepare(`
      SELECT id FROM paid_enrollments 
      WHERE user_id = ? AND course_id = ? AND payment_status = 'completed'
    `).bind(user.id, courseId).first()

    if (enrollment) {
      return c.json({ error: 'Ya estás inscrito en este curso' }, 400)
    }

    // Crear Payment Intent con Stripe
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' })

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(course.price * 100), // Convertir a centavos
      currency: course.currency.toLowerCase(),
      metadata: {
        courseId: courseId.toString(),
        userId: user.id.toString(),
        courseName: course.title
      }
    })

    return c.json({ 
      clientSecret: paymentIntent.client_secret
    })

  } catch (error) {
    console.error('Error creando payment intent:', error)
    return c.json({ error: 'Error al procesar el pago' }, 500)
  }
})

// API: Verificar pago de Stripe
app.post('/api/verify-payment', async (c) => {
  try {
    const { getCurrentUser } = await import('./auth-utils')
    const user = await getCurrentUser(c)

    if (!user) {
      return c.json({ error: 'No autenticado' }, 401)
    }

    const body = await c.req.json()
    const { paymentIntentId, courseId } = body

    // Verificar el pago con Stripe
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' })

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return c.json({ error: 'El pago no fue exitoso' }, 400)
    }

    // Obtener información del curso
    const course = await c.env.DB.prepare(`
      SELECT id, title, price, currency FROM courses WHERE id = ? AND published = 1
    `).bind(courseId).first()

    if (!course) {
      return c.json({ error: 'Curso no encontrado' }, 404)
    }

    // Crear inscripción pagada
    const result = await c.env.DB.prepare(`
      INSERT INTO paid_enrollments 
        (user_id, course_id, payment_id, payment_status, amount_paid, currency, payment_method, enrolled_at)
      VALUES (?, ?, ?, 'completed', ?, ?, 'stripe', CURRENT_TIMESTAMP)
    `).bind(
      user.id,
      courseId,
      paymentIntentId,
      course.price,
      course.currency
    ).run()

    // Registrar transacción
    await c.env.DB.prepare(`
      INSERT INTO payment_transactions 
        (user_id, enrollment_id, stripe_payment_intent_id, amount, currency, status, payment_method_type, created_at)
      VALUES (?, ?, ?, ?, ?, 'succeeded', 'card', CURRENT_TIMESTAMP)
    `).bind(
      user.id,
      result.meta.last_row_id,
      paymentIntentId,
      course.price,
      course.currency
    ).run()

    return c.json({ 
      success: true,
      message: 'Inscripción completada exitosamente'
    })

  } catch (error) {
    console.error('Error verificando pago:', error)
    return c.json({ error: 'Error al verificar el pago' }, 500)
  }
})

// API: Crear orden de PayPal
app.post('/api/create-paypal-order', async (c) => {
  try {
    const { getCurrentUser } = await import('./auth-utils')
    const user = await getCurrentUser(c)

    if (!user) {
      return c.json({ error: 'No autenticado' }, 401)
    }

    const body = await c.req.json()
    const { courseId } = body

    // Obtener información del curso
    const course = await c.env.DB.prepare(`
      SELECT id, title, price, currency FROM courses WHERE id = ? AND published = 1
    `).bind(courseId).first()

    if (!course) {
      return c.json({ error: 'Curso no encontrado' }, 404)
    }

    // Crear orden de PayPal usando REST API directamente
    const auth = btoa(c.env.PAYPAL_CLIENT_ID + ':' + c.env.PAYPAL_CLIENT_SECRET)
    const baseURL = c.env.PAYPAL_MODE === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com'

    const response = await fetch(baseURL + '/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + auth
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: course.currency,
            value: course.price.toFixed(2)
          },
          description: course.title,
          custom_id: user.id + '-' + courseId
        }]
      })
    })

    const order = await response.json()

    if (!response.ok) {
      console.error('PayPal error:', order)
      return c.json({ error: 'Error al crear orden de PayPal' }, 500)
    }

    return c.json({ orderId: order.id })

  } catch (error) {
    console.error('Error creando orden PayPal:', error)
    return c.json({ error: 'Error al procesar el pago' }, 500)
  }
})

// API: Capturar orden de PayPal
app.post('/api/capture-paypal-order', async (c) => {
  try {
    const { getCurrentUser } = await import('./auth-utils')
    const user = await getCurrentUser(c)

    if (!user) {
      return c.json({ error: 'No autenticado' }, 401)
    }

    const body = await c.req.json()
    const { orderId, courseId } = body

    // Capturar el pago de PayPal
    const auth = btoa(c.env.PAYPAL_CLIENT_ID + ':' + c.env.PAYPAL_CLIENT_SECRET)
    const baseURL = c.env.PAYPAL_MODE === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com'

    const response = await fetch(baseURL + '/v2/checkout/orders/' + orderId + '/capture', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + auth
      }
    })

    const capture = await response.json()

    if (!response.ok || capture.status !== 'COMPLETED') {
      console.error('PayPal capture error:', capture)
      return c.json({ error: 'Error al capturar el pago' }, 500)
    }

    // Obtener información del curso
    const course = await c.env.DB.prepare(`
      SELECT id, title, price, currency FROM courses WHERE id = ? AND published = 1
    `).bind(courseId).first()

    if (!course) {
      return c.json({ error: 'Curso no encontrado' }, 404)
    }

    // Crear inscripción pagada
    const result = await c.env.DB.prepare(`
      INSERT INTO paid_enrollments 
        (user_id, course_id, payment_id, payment_status, amount_paid, currency, payment_method, enrolled_at)
      VALUES (?, ?, ?, 'completed', ?, ?, 'paypal', CURRENT_TIMESTAMP)
    `).bind(
      user.id,
      courseId,
      orderId,
      course.price,
      course.currency
    ).run()

    // Registrar transacción
    await c.env.DB.prepare(`
      INSERT INTO payment_transactions 
        (user_id, enrollment_id, amount, currency, status, payment_method_type, metadata, created_at)
      VALUES (?, ?, ?, ?, 'succeeded', 'paypal', ?, CURRENT_TIMESTAMP)
    `).bind(
      user.id,
      result.meta.last_row_id,
      course.price,
      course.currency,
      JSON.stringify({ orderId, captureId: capture.id })
    ).run()

    return c.json({ 
      success: true,
      message: 'Inscripción completada exitosamente'
    })

  } catch (error) {
    console.error('Error capturando orden PayPal:', error)
    return c.json({ error: 'Error al procesar el pago' }, 500)
  }
})

// ===== WEBHOOKS DE PAGOS =====

/**
 * Webhook de Stripe
 * Maneja eventos asíncronos de Stripe
 */
app.post('/api/webhooks/stripe', async (c) => {
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' })
    
    const sig = c.req.header('stripe-signature')
    if (!sig) {
      return c.json({ error: 'No signature header' }, 400)
    }

    const body = await c.req.text()
    
    let event: any

    try {
      // Verificar firma del webhook
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        c.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return c.json({ error: 'Invalid signature' }, 400)
    }

    // Importar utilidades de webhook
    const {
      logWebhook,
      updateEnrollmentStatus,
      getEnrollmentByPaymentId,
      createEnrollmentFromWebhook,
      logWebhookTransaction,
      processRefund,
      extractCourseDataFromStripeMetadata
    } = await import('./webhook-utils')

    // Registrar webhook recibido
    await logWebhook(c.env.DB, 'stripe', event.type, event.id, event.data.object)

    console.log('Stripe webhook received:', event.type)

    // Procesar eventos según tipo
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        console.log('Payment succeeded:', paymentIntent.id)

        // Extraer datos del curso desde metadata
        const courseData = extractCourseDataFromStripeMetadata(paymentIntent.metadata)
        
        if (!courseData) {
          console.error('No course data in payment intent metadata')
          await logWebhook(c.env.DB, 'stripe', event.type, event.id, paymentIntent, 'failed', 'Missing course metadata')
          break
        }

        // Verificar si ya existe inscripción
        let enrollment = await getEnrollmentByPaymentId(c.env.DB, paymentIntent.id, 'stripe')

        if (!enrollment) {
          // Crear inscripción
          enrollment = await createEnrollmentFromWebhook(c.env.DB, {
            userId: courseData.userId,
            courseId: courseData.courseId,
            paymentId: paymentIntent.id,
            amount: paymentIntent.amount / 100, // Convertir de centavos
            currency: paymentIntent.currency.toUpperCase(),
            provider: 'stripe'
          })

          console.log('Enrollment created from webhook:', enrollment?.id)
        } else {
          // Actualizar estado si ya existe
          await updateEnrollmentStatus(c.env.DB, paymentIntent.id, 'completed', 'stripe')
          console.log('Enrollment updated:', enrollment.id)
        }

        // Registrar transacción
        await logWebhookTransaction(c.env.DB, {
          userId: courseData.userId,
          enrollmentId: enrollment?.id as number,
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency.toUpperCase(),
          status: 'succeeded',
          paymentMethodType: 'card',
          metadata: paymentIntent.metadata
        })

        // Marcar webhook como procesado
        await logWebhook(c.env.DB, 'stripe', event.type, event.id, paymentIntent, 'processed')

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        console.log('Payment failed:', paymentIntent.id)

        // Actualizar estado de inscripción si existe
        const updated = await updateEnrollmentStatus(c.env.DB, paymentIntent.id, 'failed', 'stripe')

        if (updated) {
          console.log('Enrollment marked as failed')
        }

        // Registrar transacción fallida
        const courseData = extractCourseDataFromStripeMetadata(paymentIntent.metadata)
        if (courseData) {
          await logWebhookTransaction(c.env.DB, {
            userId: courseData.userId,
            enrollmentId: null,
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency.toUpperCase(),
            status: 'failed',
            paymentMethodType: 'card',
            metadata: {
              error: paymentIntent.last_payment_error?.message || 'Payment failed'
            }
          })
        }

        await logWebhook(c.env.DB, 'stripe', event.type, event.id, paymentIntent, 'processed')

        break
      }

      case 'charge.refunded': {
        const charge = event.data.object
        console.log('Charge refunded:', charge.id)

        // Obtener payment intent ID
        const paymentIntentId = charge.payment_intent

        if (paymentIntentId) {
          try {
            // Procesar reembolso
            const enrollment = await processRefund(
              c.env.DB,
              paymentIntentId as string,
              'stripe',
              charge.amount_refunded / 100,
              'stripe_refund'
            )

            console.log('Refund processed for enrollment:', enrollment?.id)
            await logWebhook(c.env.DB, 'stripe', event.type, event.id, charge, 'processed')
          } catch (error: any) {
            console.error('Error processing refund:', error.message)
            await logWebhook(c.env.DB, 'stripe', event.type, event.id, charge, 'failed', error.message)
          }
        }

        break
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object
        console.log('Dispute created:', dispute.id)

        // Marcar inscripción como en disputa (opcional)
        const paymentIntentId = dispute.payment_intent
        if (paymentIntentId) {
          await c.env.DB.prepare(`
            UPDATE paid_enrollments 
            SET payment_status = 'disputed', updated_at = CURRENT_TIMESTAMP
            WHERE payment_id = ? AND payment_method = 'stripe'
          `).bind(paymentIntentId).run()
        }

        await logWebhook(c.env.DB, 'stripe', event.type, event.id, dispute, 'processed')

        break
      }

      default:
        console.log('Unhandled event type:', event.type)
        await logWebhook(c.env.DB, 'stripe', event.type, event.id, event.data.object, 'processed')
    }

    return c.json({ received: true })

  } catch (error: any) {
    console.error('Webhook error:', error)
    return c.json({ error: error.message }, 500)
  }
})

/**
 * Webhook de PayPal
 * Maneja notificaciones IPN de PayPal
 */
app.post('/api/webhooks/paypal', async (c) => {
  try {
    const body = await c.req.json()
    const webhookId = c.req.header('paypal-transmission-id')
    
    if (!webhookId) {
      return c.json({ error: 'No webhook ID header' }, 400)
    }

    // Importar utilidades
    const {
      logWebhook,
      updateEnrollmentStatus,
      getEnrollmentByPaymentId,
      processRefund,
      logWebhookTransaction,
      extractCourseDataFromPayPalCustomId,
      verifyPayPalWebhookSignature
    } = await import('./webhook-utils')

    const eventType = body.event_type

    // Registrar webhook recibido
    await logWebhook(c.env.DB, 'paypal', eventType, body.id || webhookId, body)

    console.log('PayPal webhook received:', eventType)

    // Verificar webhook con PayPal
    if (c.env.PAYPAL_WEBHOOK_ID) {
      const isValid = await verifyPayPalWebhookSignature(c.env, c.req.raw.headers, body)

      if (!isValid) {
        console.error('⚠️ PAYPAL WEBHOOK SIGNATURE VERIFICATION FAILED')
        // En soft-rollout continuamos, pero logueamos el error
      } else {
        console.log('✅ PayPal webhook signature verified')
      }
    } else {
      console.warn('⚠️ PAYPAL_WEBHOOK_ID not set, skipping signature verification')
    }

    // Procesar eventos según tipo
    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        const resource = body.resource
        const orderId = resource.supplementary_data?.related_ids?.order_id || resource.id
        
        console.log('Payment capture completed:', orderId)

        // Extraer datos del curso
        const customId = resource.custom_id || resource.supplementary_data?.custom_id
        let courseData = null

        if (customId) {
          courseData = extractCourseDataFromPayPalCustomId(customId)
        }

        if (!courseData) {
          console.error('No course data in PayPal custom_id')
          await logWebhook(c.env.DB, 'paypal', eventType, body.id, resource, 'failed', 'Missing course data')
          break
        }

        // Verificar si existe inscripción
        let enrollment = await getEnrollmentByPaymentId(c.env.DB, orderId, 'paypal')

        if (!enrollment) {
          // Puede que ya se haya creado en el flujo normal, buscar por cualquier order ID relacionado
          enrollment = await c.env.DB.prepare(`
            SELECT * FROM paid_enrollments 
            WHERE user_id = ? AND course_id = ? AND payment_method = 'paypal'
            ORDER BY created_at DESC LIMIT 1
          `).bind(courseData.userId, courseData.courseId).first()
        }

        if (enrollment) {
          // Actualizar estado
          await updateEnrollmentStatus(c.env.DB, orderId, 'completed', 'paypal')
          console.log('Enrollment confirmed via webhook:', enrollment.id)
        }

        // Registrar transacción
        await logWebhookTransaction(c.env.DB, {
          userId: courseData.userId,
          enrollmentId: enrollment?.id as number || null,
          amount: parseFloat(resource.amount.value),
          currency: resource.amount.currency_code,
          status: 'succeeded',
          paymentMethodType: 'paypal',
          metadata: { orderId, captureId: resource.id }
        })

        await logWebhook(c.env.DB, 'paypal', eventType, body.id, resource, 'processed')

        break
      }

      case 'PAYMENT.CAPTURE.REFUNDED': {
        const resource = body.resource
        const captureId = resource.id
        
        console.log('Payment refunded:', captureId)

        // Buscar inscripción por metadata
        const enrollment = await c.env.DB.prepare(`
          SELECT pe.* FROM paid_enrollments pe
          JOIN payment_transactions pt ON pe.id = pt.enrollment_id
          WHERE pt.metadata LIKE ? AND pe.payment_method = 'paypal'
          LIMIT 1
        `).bind('%' + captureId + '%').first()

        if (enrollment) {
          try {
            await processRefund(
              c.env.DB,
              enrollment.payment_id as string,
              'paypal',
              parseFloat(resource.amount.value),
              'paypal_refund'
            )

            console.log('Refund processed for enrollment:', enrollment.id)
            await logWebhook(c.env.DB, 'paypal', eventType, body.id, resource, 'processed')
          } catch (error: any) {
            console.error('Error processing refund:', error.message)
            await logWebhook(c.env.DB, 'paypal', eventType, body.id, resource, 'failed', error.message)
          }
        }

        break
      }

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.DECLINED': {
        const resource = body.resource
        console.log('Payment denied/declined:', resource.id)

        await logWebhook(c.env.DB, 'paypal', eventType, body.id, resource, 'processed')

        break
      }

      default:
        console.log('Unhandled PayPal event:', eventType)
        await logWebhook(c.env.DB, 'paypal', eventType, body.id || webhookId, body, 'processed')
    }

    return c.json({ received: true })

  } catch (error: any) {
    console.error('PayPal webhook error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// ===== PÁGINA: MI APRENDIZAJE (Dashboard del Estudiante) =====

app.get('/mi-aprendizaje', async (c) => {
  try {
    // Verificar autenticación
    const { getCurrentUser } = await import('./auth-utils')
    const user = await getCurrentUser(c)

    if (!user) {
      return c.redirect('/login')
    }

    // Obtener cursos inscritos con progreso
    const enrollments = await c.env.DB.prepare(`
      SELECT 
        pe.id as enrollment_id,
        pe.enrolled_at,
        pe.completed,
        pe.completion_date,
        c.id as course_id,
        c.slug,
        c.title,
        c.subtitle,
        c.featured_image,
        c.duration_weeks,
        c.level,
        c.price
      FROM paid_enrollments pe
      JOIN courses c ON pe.course_id = c.id
      WHERE pe.user_id = ? AND pe.payment_status = 'completed' AND pe.access_revoked = 0
      ORDER BY pe.enrolled_at DESC
    `).bind(user.id).all()

    // Calcular progreso de cada curso
    const coursesWithProgress = await Promise.all(
      (enrollments.results || []).map(async (enrollment: any) => {
        const { getCourseProgress } = await import('./auth-utils')
        const progress = await getCourseProgress(c.env.DB, user.id, enrollment.course_id)
        
        // Obtener primera lección del curso
        const firstLesson = await c.env.DB.prepare(`
          SELECT id FROM lessons 
          WHERE course_id = ? AND published = 1 
          ORDER BY order_index ASC 
          LIMIT 1
        `).bind(enrollment.course_id).first()

        // Obtener última lección en progreso (si existe)
        const lastLesson = await c.env.DB.prepare(`
          SELECT l.id 
          FROM student_progress sp
          JOIN lessons l ON sp.lesson_id = l.id
          WHERE sp.user_id = ? AND sp.course_id = ? AND l.published = 1
          ORDER BY sp.updated_at DESC
          LIMIT 1
        `).bind(user.id, enrollment.course_id).first()

        // Obtener certificado si existe
        const certificate = await c.env.DB.prepare(`
          SELECT id FROM certificates 
          WHERE user_id = ? AND course_id = ?
        `).bind(user.id, enrollment.course_id).first()
        
        return {
          ...enrollment,
          progress: progress.percentage,
          completed_lessons: progress.completed,
          total_lessons: progress.total,
          next_lesson_id: lastLesson?.id || firstLesson?.id,
          certificate_id: certificate?.id
        }
      })
    )

    return c.render(
      <div>
        <section className="hero hero-small">
          <div className="container">
            <h1>Mi Aprendizaje</h1>
            <p className="lead">Bienvenido de vuelta, {user.name}</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="dashboard-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;">
              <div>
                <h2>Mis Cursos</h2>
                <p style="color: #64748b; margin-top: 10px;">
                  {coursesWithProgress.length === 0 
                    ? 'No tienes cursos inscritos todavía' 
                    : `Tienes ${coursesWithProgress.length} curso${coursesWithProgress.length > 1 ? 's' : ''} activo${coursesWithProgress.length > 1 ? 's' : ''}`
                  }
                </p>
              </div>
              <div>
                <a href="/cursos" className="btn btn-primary">
                  <i className="fas fa-plus"></i> Explorar Cursos
                </a>
                <button onclick="logout()" className="btn btn-secondary" style="margin-left: 10px;">
                  <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
                </button>
              </div>
            </div>

            {coursesWithProgress.length === 0 ? (
              <div className="empty-state" style="text-align: center; padding: 60px 20px; background: #f8fafc; border-radius: 12px;">
                <i className="fas fa-graduation-cap fa-4x" style="color: #cbd5e1; margin-bottom: 20px;"></i>
                <h3 style="color: #1e293b; margin-bottom: 15px;">Aún no tienes cursos</h3>
                <p style="color: #64748b; margin-bottom: 30px;">
                  Explora nuestro catálogo y comienza tu transformación hoy
                </p>
                <a href="/cursos" className="btn btn-primary btn-lg">
                  <i className="fas fa-search"></i> Explorar Cursos
                </a>
              </div>
            ) : (
              <div className="courses-dashboard-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 30px;">
                {coursesWithProgress.map((course: any) => (
                  <div className="dashboard-course-card" key={course.course_id} style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s;">
                    <div style="position: relative; width: 100%; padding-top: 56.25%; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);">
                      {course.featured_image && (
                        <img 
                          src={course.featured_image} 
                          alt={course.title}
                          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;"
                        />
                      )}
                      <div style="position: absolute; top: 10px; right: 10px;">
                        {course.completed ? (
                          <span className="badge" style="background: #10b981; padding: 6px 12px; border-radius: 20px; font-size: 0.85rem;">
                            <i className="fas fa-check-circle"></i> Completado
                          </span>
                        ) : (
                          <span className="badge" style="background: #f59e0b; padding: 6px 12px; border-radius: 20px; font-size: 0.85rem;">
                            <i className="fas fa-spinner"></i> En Progreso
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div style="padding: 20px;">
                      <h3 style="font-size: 1.2rem; color: #1e293b; margin-bottom: 10px; font-weight: 700;">
                        {course.title}
                      </h3>
                      <p style="color: #64748b; font-size: 0.95rem; margin-bottom: 20px;">
                        {course.subtitle}
                      </p>
                      
                      {/* Progress Bar */}
                      <div style="margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                          <span style="font-size: 0.9rem; color: #64748b;">Progreso</span>
                          <span style="font-size: 0.9rem; font-weight: 600; color: #8b5cf6;">{course.progress}%</span>
                        </div>
                        <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 10px; overflow: hidden;">
                          <div 
                            style={`width: ${course.progress}%; height: 100%; background: linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%); transition: width 0.3s;`}
                          ></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.85rem; color: #94a3b8;">
                          <span>{course.completed_lessons} / {course.total_lessons} lecciones</span>
                          <span>{course.duration_weeks} semanas</span>
                        </div>
                      </div>
                      
                      <a href={course.next_lesson_id ? `/cursos/${course.slug}/leccion/${course.next_lesson_id}` : `/cursos/${course.slug}`} className="btn btn-primary btn-block">
                        <i className="fas fa-play"></i> {course.progress > 0 ? 'Continuar Aprendiendo' : 'Comenzar Curso'}
                      </a>
                      
                      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px;">
                        <a href={`/cursos/${course.slug}`} className="btn btn-sm btn-outline" style="font-size: 0.85rem;">
                          <i className="fas fa-list"></i> Ver Temario
                        </a>
                        {course.certificate_id && (
                          <a href={`/certificado/${course.certificate_id}`} className="btn btn-sm btn-outline" style="font-size: 0.85rem; background: #10b981; color: white; border-color: #10b981;">
                            <i className="fas fa-certificate"></i> Certificado
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Stats Section */}
        {coursesWithProgress.length > 0 && (
          <section className="section bg-light">
            <div className="container">
              <h2 style="text-align: center; margin-bottom: 40px;">Tu Progreso General</h2>
              <div className="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 30px; max-width: 900px; margin: 0 auto;">
                <div className="stat-card" style="text-align: center; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                  <i className="fas fa-book fa-3x" style="color: #8b5cf6; margin-bottom: 15px;"></i>
                  <h3 style="font-size: 2.5rem; font-weight: 700; color: #1e293b; margin-bottom: 5px;">
                    {coursesWithProgress.length}
                  </h3>
                  <p style="color: #64748b;">Curso{coursesWithProgress.length > 1 ? 's' : ''} Activo{coursesWithProgress.length > 1 ? 's' : ''}</p>
                </div>
                
                <div className="stat-card" style="text-align: center; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                  <i className="fas fa-tasks fa-3x" style="color: #10b981; margin-bottom: 15px;"></i>
                  <h3 style="font-size: 2.5rem; font-weight: 700; color: #1e293b; margin-bottom: 5px;">
                    {coursesWithProgress.reduce((sum, c) => sum + c.completed_lessons, 0)}
                  </h3>
                  <p style="color: #64748b;">Lecciones Completadas</p>
                </div>
                
                <div className="stat-card" style="text-align: center; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                  <i className="fas fa-certificate fa-3x" style="color: #f59e0b; margin-bottom: 15px;"></i>
                  <h3 style="font-size: 2.5rem; font-weight: 700; color: #1e293b; margin-bottom: 5px;">
                    {coursesWithProgress.filter(c => c.completed).length}
                  </h3>
                  <p style="color: #64748b;">Curso{coursesWithProgress.filter(c => c.completed).length !== 1 ? 's' : ''} Completado{coursesWithProgress.filter(c => c.completed).length !== 1 ? 's' : ''}</p>
                </div>
                
                <div className="stat-card" style="text-align: center; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                  <i className="fas fa-chart-line fa-3x" style="color: #ec4899; margin-bottom: 15px;"></i>
                  <h3 style="font-size: 2.5rem; font-weight: 700; color: #1e293b; margin-bottom: 5px;">
                    {Math.round(coursesWithProgress.reduce((sum, c) => sum + c.progress, 0) / coursesWithProgress.length)}%
                  </h3>
                  <p style="color: #64748b;">Progreso Promedio</p>
                </div>
              </div>
            </div>
          </section>
        )}

        <script dangerouslySetInnerHTML={{__html: `
          async function logout() {
            if (!confirm('¿Estás seguro que deseas cerrar sesión?')) return;
            
            try {
              const response = await fetch('/api/logout', { method: 'POST' });
              if (response.ok) {
                window.location.href = '/';
              }
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              alert('Error al cerrar sesión. Por favor, intenta de nuevo.');
            }
          }
        `}} />
      </div>
    )
  } catch (error) {
    console.error('Error al cargar dashboard:', error)
    return c.render(
      <div>
        <section className="section">
          <div className="container text-center">
            <h1>Error al cargar tu aprendizaje</h1>
            <p>Por favor, intenta de nuevo más tarde.</p>
            <a href="/" className="btn btn-primary">Volver al inicio</a>
          </div>
        </section>
      </div>
    )
  }
})

// ===== GESTIÓN DE LECCIONES =====

// Página: Ver lección individual
app.get('/cursos/:courseSlug/leccion/:lessonId', async (c) => {
  try {
    const { getCurrentUser, userHasAccess } = await import('./auth-utils')
    const user = await getCurrentUser(c)

    if (!user) {
      return c.redirect('/login')
    }

    const courseSlug = c.req.param('courseSlug')
    const lessonId = parseInt(c.req.param('lessonId'))

    // Obtener información del curso
    const course = await c.env.DB.prepare(`
      SELECT id, title, slug FROM courses WHERE slug = ? AND published = 1
    `).bind(courseSlug).first()

    if (!course) {
      return c.render(
        <div>
          <section className="section">
            <div className="container text-center">
              <h1>Curso no encontrado</h1>
              <a href="/cursos" className="btn btn-primary">Ver Cursos</a>
            </div>
          </section>
        </div>
      )
    }

    // Verificar acceso al curso
    const hasAccess = await userHasAccess(c.env.DB, user.id, course.id)
    
    if (!hasAccess) {
      return c.render(
        <div>
          <section className="section">
            <div className="container text-center">
              <i className="fas fa-lock fa-3x" style="color: #f59e0b; margin-bottom: 20px;"></i>
              <h1>Acceso Restringido</h1>
              <p className="lead">Necesitas inscribirte en este curso para ver esta lección.</p>
              <a href={`/cursos/${courseSlug}`} className="btn btn-primary">Ver Curso</a>
            </div>
          </section>
        </div>
      )
    }

    // Obtener lección
    const lesson = await c.env.DB.prepare(`
      SELECT * FROM lessons WHERE id = ? AND course_id = ? AND published = 1
    `).bind(lessonId, course.id).first()

    if (!lesson) {
      return c.render(
        <div>
          <section className="section">
            <div className="container text-center">
              <h1>Lección no encontrada</h1>
              <a href="/mi-aprendizaje" className="btn btn-primary">Volver a Mis Cursos</a>
            </div>
          </section>
        </div>
      )
    }

    // Obtener progreso del estudiante
    const progress = await c.env.DB.prepare(`
      SELECT * FROM student_progress 
      WHERE user_id = ? AND lesson_id = ? AND course_id = ?
    `).bind(user.id, lessonId, course.id).first()

    // Obtener todas las lecciones del curso para navegación
    const allLessons = await c.env.DB.prepare(`
      SELECT id, module_number, lesson_number, title, video_duration, is_preview
      FROM lessons 
      WHERE course_id = ? AND published = 1
      ORDER BY order_index ASC
    `).bind(course.id).all()

    // Obtener lecciones completadas
    const completedLessons = await c.env.DB.prepare(`
      SELECT lesson_id FROM student_progress 
      WHERE user_id = ? AND course_id = ? AND completed = 1
    `).bind(user.id, course.id).all()

    const completedIds = new Set((completedLessons.results || []).map((p: any) => p.lesson_id))

    // Agrupar lecciones por módulo
    const moduleMap = new Map()
    for (const l of (allLessons.results || [])) {
      if (!moduleMap.has(l.module_number)) {
        moduleMap.set(l.module_number, [])
      }
      moduleMap.get(l.module_number).push(l)
    }

    // Encontrar lección anterior y siguiente
    const currentIndex = (allLessons.results || []).findIndex((l: any) => l.id === lessonId)
    const prevLesson = currentIndex > 0 ? (allLessons.results || [])[currentIndex - 1] : null
    const nextLesson = currentIndex < (allLessons.results || []).length - 1 ? (allLessons.results || [])[currentIndex + 1] : null

    // Obtener recursos de la lección
    const resources = await c.env.DB.prepare(`
      SELECT * FROM lesson_resources WHERE lesson_id = ? ORDER BY created_at ASC
    `).bind(lessonId).all()

    return c.render(
      <div>
        <style dangerouslySetInnerHTML={{__html: `
          .lesson-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
          }
          .lesson-layout {
            display: grid;
            grid-template-columns: 1fr 350px;
            gap: 30px;
            margin-top: 20px;
          }
          .lesson-main {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .video-container {
            position: relative;
            width: 100%;
            padding-top: 56.25%;
            background: #000;
          }
          .video-container iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }
          .lesson-content {
            padding: 30px;
          }
          .lesson-sidebar {
            position: sticky;
            top: 20px;
            height: fit-content;
          }
          .sidebar-section {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .lesson-list {
            max-height: 600px;
            overflow-y: auto;
          }
          .lesson-item {
            padding: 12px;
            margin-bottom: 8px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            border: 2px solid transparent;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .lesson-item:hover {
            background: #f8fafc;
          }
          .lesson-item.active {
            background: #ede9fe;
            border-color: #8b5cf6;
          }
          .lesson-item.completed {
            background: #dcfce7;
          }
          .lesson-checkbox {
            width: 20px;
            height: 20px;
            border: 2px solid #cbd5e1;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .lesson-checkbox.checked {
            background: #10b981;
            border-color: #10b981;
            color: white;
          }
          .module-header {
            font-weight: 700;
            color: #1e293b;
            margin: 20px 0 10px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #e2e8f0;
          }
          .notes-area {
            width: 100%;
            min-height: 120px;
            padding: 15px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-family: inherit;
            resize: vertical;
          }
          .notes-area:focus {
            outline: none;
            border-color: #8b5cf6;
          }
          .resource-item {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
            margin-bottom: 10px;
            transition: all 0.2s;
          }
          .resource-item:hover {
            background: #f1f5f9;
          }
          .resource-icon {
            width: 40px;
            height: 40px;
            background: #8b5cf6;
            color: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          @media (max-width: 968px) {
            .lesson-layout {
              grid-template-columns: 1fr;
            }
            .lesson-sidebar {
              position: static;
            }
          }
        `}} />

        <div className="lesson-container">
          {/* Breadcrumb */}
          <div style="display: flex; align-items: center; gap: 10px; color: #64748b; margin-bottom: 20px;">
            <a href="/mi-aprendizaje" style="color: #8b5cf6; text-decoration: none;">Mis Cursos</a>
            <i className="fas fa-chevron-right" style="font-size: 12px;"></i>
            <a href={`/cursos/${courseSlug}`} style="color: #8b5cf6; text-decoration: none;">{course.title}</a>
            <i className="fas fa-chevron-right" style="font-size: 12px;"></i>
            <span>Módulo {lesson.module_number}, Lección {lesson.lesson_number}</span>
          </div>

          <div className="lesson-layout">
            {/* Main Content */}
            <div className="lesson-main">
              {/* Video */}
              {lesson.video_url && (
                <div className="video-container">
                  {progress?.last_position && progress.last_position > 10 && !progress.completed && (
                    <div style="position: absolute; top: 10px; left: 10px; z-index: 10; background: rgba(139, 92, 246, 0.95); color: white; padding: 8px 15px; border-radius: 20px; font-size: 13px; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 8px;">
                      <i className="fas fa-play-circle"></i>
                      Continuar desde {Math.floor(progress.last_position / 60)}:{(progress.last_position % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                  <iframe
                    src={lesson.video_url}
                    title={lesson.title}
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                  ></iframe>
                </div>
              )}

              {/* Lesson Content */}
              <div className="lesson-content">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
                  <div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                      <span className="badge" style="background: #8b5cf6; color: white; padding: 5px 12px; border-radius: 20px; font-size: 12px;">
                        Módulo {lesson.module_number}
                      </span>
                      <span style="color: #64748b; font-size: 14px;">
                        Lección {lesson.lesson_number}
                      </span>
                    </div>
                    <h1 style="font-size: 2rem; color: #1e293b; margin-bottom: 15px;">{lesson.title}</h1>
                    {lesson.description && (
                      <p style="color: #64748b; font-size: 1.1rem; line-height: 1.6;">{lesson.description}</p>
                    )}
                  </div>
                  <button 
                    id="completeBtn"
                    onclick="toggleComplete()"
                    className="btn btn-success"
                    style={`white-space: nowrap; ${progress?.completed ? 'background: #10b981;' : 'background: #64748b;'}`}
                  >
                    <i className={progress?.completed ? 'fas fa-check-circle' : 'far fa-circle'}></i>
                    {progress?.completed ? 'Completada' : 'Marcar Completa'}
                  </button>
                </div>

                {/* Navigation Buttons */}
                <div style="display: flex; gap: 10px; margin-bottom: 30px; padding-bottom: 30px; border-bottom: 2px solid #e2e8f0;">
                  {prevLesson && (
                    <a href={`/cursos/${courseSlug}/leccion/${prevLesson.id}`} className="btn btn-secondary">
                      <i className="fas fa-arrow-left"></i> Anterior
                    </a>
                  )}
                  {nextLesson && (
                    <a href={`/cursos/${courseSlug}/leccion/${nextLesson.id}`} className="btn btn-primary" style="margin-left: auto;">
                      Siguiente <i className="fas fa-arrow-right"></i>
                    </a>
                  )}
                </div>

                {/* Lesson Content */}
                {lesson.content && (
                  <div style="margin-bottom: 40px;">
                    <h2 style="font-size: 1.5rem; color: #1e293b; margin-bottom: 20px;">Contenido de la Lección</h2>
                    <div style="line-height: 1.8; color: #475569;" dangerouslySetInnerHTML={{__html: lesson.content}} />
                  </div>
                )}

                {/* Resources */}
                {resources.results && resources.results.length > 0 && (
                  <div style="margin-bottom: 40px;">
                    <h2 style="font-size: 1.5rem; color: #1e293b; margin-bottom: 20px;">
                      <i className="fas fa-download"></i> Recursos Descargables
                    </h2>
                    {resources.results.map((resource: any) => (
                      <a href={resource.file_url} target="_blank" rel="noopener noreferrer" className="resource-item" style="text-decoration: none; color: inherit;">
                        <div className="resource-icon">
                          <i className={`fas fa-file-${resource.file_type === 'pdf' ? 'pdf' : resource.file_type === 'video' ? 'video' : 'alt'}`}></i>
                        </div>
                        <div style="flex: 1;">
                          <h4 style="margin: 0 0 5px 0; color: #1e293b;">{resource.title}</h4>
                          {resource.description && (
                            <p style="margin: 0; color: #64748b; font-size: 14px;">{resource.description}</p>
                          )}
                          <div style="display: flex; gap: 15px; margin-top: 5px; font-size: 12px; color: #94a3b8;">
                            <span><i className="fas fa-file"></i> {resource.file_type.toUpperCase()}</span>
                            {resource.file_size && (
                              <span><i className="fas fa-hdd"></i> {(resource.file_size / 1024).toFixed(0)} KB</span>
                            )}
                            <span><i className="fas fa-download"></i> {resource.downloads_count || 0} descargas</span>
                          </div>
                        </div>
                        <i className="fas fa-external-link-alt" style="color: #8b5cf6;"></i>
                      </a>
                    ))}
                  </div>
                )}

                {/* Notes Section */}
                <div>
                  <h2 style="font-size: 1.5rem; color: #1e293b; margin-bottom: 20px;">
                    <i className="fas fa-sticky-note"></i> Mis Notas
                  </h2>
                  <textarea 
                    id="notesArea"
                    className="notes-area"
                    placeholder="Escribe tus notas sobre esta lección..."
                  >{progress?.notes || ''}</textarea>
                  <button onclick="saveNotes()" className="btn btn-primary" style="margin-top: 15px;">
                    <i className="fas fa-save"></i> Guardar Notas
                  </button>
                  <span id="saveStatus" style="margin-left: 15px; color: #10b981; display: none;">
                    <i className="fas fa-check"></i> Notas guardadas
                  </span>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lesson-sidebar">
              {/* Progress Section */}
              <div className="sidebar-section">
                <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 1.1rem;">
                  <i className="fas fa-chart-line" style="color: #8b5cf6;"></i> Tu Progreso
                </h3>
                <div style="margin-bottom: 15px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #64748b; font-size: 14px;">Lecciones completadas</span>
                    <span style="font-weight: 700; color: #1e293b;">{completedIds.size} / {allLessons.results?.length || 0}</span>
                  </div>
                  <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                    <div style={`width: ${((completedIds.size / (allLessons.results?.length || 1)) * 100).toFixed(0)}%; height: 100%; background: linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%); transition: width 0.3s;`}></div>
                  </div>
                  <p style="text-align: center; margin-top: 10px; font-size: 24px; font-weight: 700; color: #8b5cf6;">
                    {((completedIds.size / (allLessons.results?.length || 1)) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Course Content */}
              <div className="sidebar-section">
                <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 1.1rem;">
                  <i className="fas fa-list"></i> Contenido del Curso
                </h3>
                <div className="lesson-list">
                  {Array.from(moduleMap.entries()).map(([moduleNum, lessons]: [number, any[]]) => (
                    <div key={moduleNum}>
                      <div className="module-header">
                        Módulo {moduleNum}
                      </div>
                      {lessons.map((l: any) => (
                        <a 
                          href={`/cursos/${courseSlug}/leccion/${l.id}`}
                          className={`lesson-item ${l.id === lessonId ? 'active' : ''} ${completedIds.has(l.id) ? 'completed' : ''}`}
                          style="text-decoration: none; color: inherit;"
                          key={l.id}
                        >
                          <div className={`lesson-checkbox ${completedIds.has(l.id) ? 'checked' : ''}`}>
                            {completedIds.has(l.id) && <i className="fas fa-check" style="font-size: 12px;"></i>}
                          </div>
                          <div style="flex: 1; min-width: 0;">
                            <div style="font-weight: 500; color: #1e293b; margin-bottom: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                              {l.lesson_number}. {l.title}
                            </div>
                            {l.video_duration && (
                              <div style="font-size: 12px; color: #64748b;">
                                <i className="fas fa-play-circle"></i> {Math.floor(l.video_duration / 60)}:{(l.video_duration % 60).toString().padStart(2, '0')} min
                              </div>
                            )}
                          </div>
                          {l.is_preview && (
                            <span style="font-size: 11px; background: #fef3c7; color: #d97706; padding: 2px 8px; border-radius: 10px;">
                              Preview
                            </span>
                          )}
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <script dangerouslySetInnerHTML={{__html: `
          let isCompleted = ${progress?.completed ? 'true' : 'false'};
          const lessonId = ${lessonId};
          const courseId = ${course.id};

          async function toggleComplete() {
            try {
              const btn = document.getElementById('completeBtn');
              btn.disabled = true;

              const response = await fetch('/api/lessons/${lessonId}/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: !isCompleted, courseId })
              });

              const data = await response.json();
              
              if (data.success) {
                isCompleted = !isCompleted;
                btn.innerHTML = isCompleted 
                  ? '<i class="fas fa-check-circle"></i> Completada'
                  : '<i class="far fa-circle"></i> Marcar Completa';
                btn.style.background = isCompleted ? '#10b981' : '#64748b';
                
                // Mostrar notificación de certificado
                if (data.certificateGenerated && data.certificateId) {
                  if (confirm('¡Felicitaciones! Has completado el curso al 100%. Tu certificado ha sido generado. ¿Deseas verlo ahora?')) {
                    window.location.href = '/certificado/' + data.certificateId;
                    return;
                  }
                }
                
                // Reload page to update sidebar
                setTimeout(() => window.location.reload(), 500);
              } else {
                alert('Error al actualizar el progreso');
              }
            } catch (error) {
              console.error('Error:', error);
              alert('Error al actualizar el progreso');
            } finally {
              document.getElementById('completeBtn').disabled = false;
            }
          }

          async function saveNotes() {
            try {
              const notes = document.getElementById('notesArea').value;
              const saveStatus = document.getElementById('saveStatus');
              
              const response = await fetch('/api/lessons/${lessonId}/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes, courseId })
              });

              const data = await response.json();
              
              if (data.success) {
                saveStatus.style.display = 'inline';
                setTimeout(() => saveStatus.style.display = 'none', 3000);
              } else {
                alert('Error al guardar notas');
              }
            } catch (error) {
              console.error('Error:', error);
              alert('Error al guardar notas');
            }
          }

          // Auto-save notes every 30 seconds
          let notesTimeout;
          document.getElementById('notesArea').addEventListener('input', () => {
            clearTimeout(notesTimeout);
            notesTimeout = setTimeout(saveNotes, 30000);
          });

          // ===== VIDEO PROGRESS TRACKING =====
          
          const lastPosition = ${progress?.last_position || 0};
          const videoDuration = ${lesson.video_duration || 0};
          let videoProgressInterval;
          let currentVideoTime = 0;
          let currentVideoDuration = 0;
          let videoReady = false;

          // Function to save video progress
          async function saveVideoProgress(position, duration) {
            try {
              await fetch('/api/lessons/${lessonId}/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  position: Math.round(position), 
                  duration: Math.round(duration), 
                  courseId 
                })
              });
            } catch (error) {
              console.error('Error saving video progress:', error);
            }
          }

          // YouTube IFrame API
          function initYouTubeTracking() {
            const iframe = document.querySelector('iframe');
            if (!iframe || !iframe.src.includes('youtube.com')) return;

            // Load YouTube IFrame API
            if (!window.YT) {
              const tag = document.createElement('script');
              tag.src = 'https://www.youtube.com/iframe_api';
              const firstScriptTag = document.getElementsByTagName('script')[0];
              firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }

            // Initialize player when API is ready
            window.onYouTubeIframeAPIReady = function() {
              const player = new YT.Player(iframe, {
                events: {
                  'onReady': function(event) {
                    videoReady = true;
                    currentVideoDuration = event.target.getDuration();
                    
                    // Restore last position if exists
                    if (lastPosition > 0 && lastPosition < currentVideoDuration - 5) {
                      event.target.seekTo(lastPosition, true);
                      console.log('Restored video position:', lastPosition);
                    }

                    // Start tracking every 10 seconds
                    videoProgressInterval = setInterval(() => {
                      try {
                        const currentTime = event.target.getCurrentTime();
                        const duration = event.target.getDuration();
                        
                        if (currentTime > 0 && duration > 0) {
                          currentVideoTime = currentTime;
                          currentVideoDuration = duration;
                          saveVideoProgress(currentTime, duration);
                        }
                      } catch (err) {
                        console.error('Error tracking YouTube progress:', err);
                      }
                    }, 10000);
                  },
                  'onStateChange': function(event) {
                    // Save on pause or end
                    if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
                      try {
                        const currentTime = event.target.getCurrentTime();
                        const duration = event.target.getDuration();
                        if (currentTime > 0 && duration > 0) {
                          saveVideoProgress(currentTime, duration);
                        }
                      } catch (err) {
                        console.error('Error saving on pause:', err);
                      }
                    }
                    
                    // Auto-complete when video ends
                    if (event.data === YT.PlayerState.ENDED && !isCompleted) {
                      setTimeout(toggleComplete, 1000);
                    }
                  }
                }
              });
            };

            // If API already loaded
            if (window.YT && window.YT.Player) {
              window.onYouTubeIframeAPIReady();
            }
          }

          // Vimeo Player API
          function initVimeoTracking() {
            const iframe = document.querySelector('iframe');
            if (!iframe || !iframe.src.includes('vimeo.com')) return;

            // Load Vimeo Player API
            if (!window.Vimeo) {
              const script = document.createElement('script');
              script.src = 'https://player.vimeo.com/api/player.js';
              script.onload = setupVimeoPlayer;
              document.head.appendChild(script);
            } else {
              setupVimeoPlayer();
            }

            function setupVimeoPlayer() {
              const player = new Vimeo.Player(iframe);
              
              player.ready().then(() => {
                videoReady = true;
                
                player.getDuration().then(duration => {
                  currentVideoDuration = duration;
                  
                  // Restore last position
                  if (lastPosition > 0 && lastPosition < duration - 5) {
                    player.setCurrentTime(lastPosition).then(() => {
                      console.log('Restored video position:', lastPosition);
                    });
                  }
                });

                // Track current time
                player.on('timeupdate', data => {
                  currentVideoTime = data.seconds;
                  currentVideoDuration = data.duration;
                });

                // Start auto-save every 10 seconds
                videoProgressInterval = setInterval(() => {
                  if (currentVideoTime > 0 && currentVideoDuration > 0) {
                    saveVideoProgress(currentVideoTime, currentVideoDuration);
                  }
                }, 10000);

                // Save on pause
                player.on('pause', () => {
                  if (currentVideoTime > 0) {
                    saveVideoProgress(currentVideoTime, currentVideoDuration);
                  }
                });

                // Save and auto-complete on end
                player.on('ended', () => {
                  saveVideoProgress(currentVideoTime, currentVideoDuration);
                  if (!isCompleted) {
                    setTimeout(toggleComplete, 1000);
                  }
                });
              });
            }
          }

          // Generic HTML5 Video tracking (for self-hosted videos)
          function initHTML5VideoTracking() {
            const video = document.querySelector('video');
            if (!video) return;

            video.addEventListener('loadedmetadata', () => {
              videoReady = true;
              currentVideoDuration = video.duration;
              
              // Restore position
              if (lastPosition > 0 && lastPosition < video.duration - 5) {
                video.currentTime = lastPosition;
                console.log('Restored video position:', lastPosition);
              }
            });

            // Track time updates
            video.addEventListener('timeupdate', () => {
              currentVideoTime = video.currentTime;
              currentVideoDuration = video.duration;
            });

            // Auto-save every 10 seconds
            videoProgressInterval = setInterval(() => {
              if (video.currentTime > 0 && video.duration > 0) {
                saveVideoProgress(video.currentTime, video.duration);
              }
            }, 10000);

            // Save on pause
            video.addEventListener('pause', () => {
              if (video.currentTime > 0) {
                saveVideoProgress(video.currentTime, video.duration);
              }
            });

            // Save and auto-complete on end
            video.addEventListener('ended', () => {
              saveVideoProgress(video.currentTime, video.duration);
              if (!isCompleted) {
                setTimeout(toggleComplete, 1000);
              }
            });
          }

          // Initialize appropriate tracking
          setTimeout(() => {
            initYouTubeTracking();
            initVimeoTracking();
            initHTML5VideoTracking();
          }, 1000);

          // Save progress before leaving page
          window.addEventListener('beforeunload', () => {
            if (currentVideoTime > 0 && currentVideoDuration > 0) {
              // Use sendBeacon for reliable saving on page unload
              const data = JSON.stringify({ 
                position: Math.round(currentVideoTime), 
                duration: Math.round(currentVideoDuration), 
                courseId 
              });
              navigator.sendBeacon('/api/lessons/${lessonId}/progress', data);
            }
          });

          // Clear interval on page unload
          window.addEventListener('unload', () => {
            if (videoProgressInterval) {
              clearInterval(videoProgressInterval);
            }
          });
        `}} />
      </div>
    )
  } catch (error) {
    console.error('Error al cargar lección:', error)
    return c.render(
      <div>
        <section className="section">
          <div className="container text-center">
            <h1>Error al cargar la lección</h1>
            <p>Por favor, intenta de nuevo más tarde.</p>
            <a href="/mi-aprendizaje" className="btn btn-primary">Volver a Mis Cursos</a>
          </div>
        </section>
      </div>
    )
  }
})

// API: Marcar lección como completada
app.post('/api/lessons/:lessonId/complete', async (c) => {
  try {
    const { getCurrentUser } = await import('./auth-utils')
    const user = await getCurrentUser(c)

    if (!user) {
      return c.json({ error: 'No autenticado' }, 401)
    }

    const lessonId = parseInt(c.req.param('lessonId'))
    const { completed, courseId } = await c.req.json()

    // Verificar que la lección existe y el usuario tiene acceso
    const { userHasAccess } = await import('./auth-utils')
    const hasAccess = await userHasAccess(c.env.DB, user.id, courseId)

    if (!hasAccess) {
      return c.json({ error: 'No tienes acceso a este curso' }, 403)
    }

    // Upsert progress
    const now = new Date().toISOString()
    
    await c.env.DB.prepare(`
      INSERT INTO student_progress (user_id, lesson_id, course_id, completed, progress_percentage, completed_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, lesson_id) 
      DO UPDATE SET 
        completed = excluded.completed,
        progress_percentage = CASE WHEN excluded.completed = 1 THEN 100 ELSE progress_percentage END,
        completed_at = CASE WHEN excluded.completed = 1 THEN excluded.completed_at ELSE completed_at END,
        updated_at = excluded.updated_at
    `).bind(
      user.id,
      lessonId,
      courseId,
      completed ? 1 : 0,
      completed ? 100 : 0,
      completed ? now : null,
      now
    ).run()

    // Actualizar progreso del curso en paid_enrollments
    const { getCourseProgress } = await import('./auth-utils')
    const progress = await getCourseProgress(c.env.DB, user.id, courseId)

    const updateResult = await c.env.DB.prepare(`
      UPDATE paid_enrollments 
      SET 
        completed = CASE WHEN ? = 100 THEN 1 ELSE 0 END,
        completion_date = CASE WHEN ? = 100 THEN ? ELSE completion_date END,
        certificate_issued = CASE WHEN ? = 100 THEN 1 ELSE certificate_issued END
      WHERE user_id = ? AND course_id = ?
    `).bind(progress.percentage, progress.percentage, now, progress.percentage, user.id, courseId).run()

    // Generar certificado automáticamente si completó al 100%
    let certificateId = null
    if (progress.percentage === 100) {
      // Obtener enrollment_id
      const enrollment = await c.env.DB.prepare(`
        SELECT id FROM paid_enrollments WHERE user_id = ? AND course_id = ?
      `).bind(user.id, courseId).first()

      if (enrollment) {
        certificateId = await generateCertificate(c.env.DB, user.id, courseId, enrollment.id)
      }
    }

    return c.json({ 
      success: true, 
      progress: progress.percentage,
      completed_lessons: progress.completed,
      total_lessons: progress.total,
      certificateGenerated: progress.percentage === 100,
      certificateId: certificateId
    })
  } catch (error) {
    console.error('Error al actualizar progreso:', error)
    return c.json({ error: 'Error al actualizar progreso' }, 500)
  }
})

// API: Guardar notas de lección
app.post('/api/lessons/:lessonId/notes', async (c) => {
  try {
    const { getCurrentUser } = await import('./auth-utils')
    const user = await getCurrentUser(c)

    if (!user) {
      return c.json({ error: 'No autenticado' }, 401)
    }

    const lessonId = parseInt(c.req.param('lessonId'))
    const { notes, courseId } = await c.req.json()

    // Verificar acceso
    const { userHasAccess } = await import('./auth-utils')
    const hasAccess = await userHasAccess(c.env.DB, user.id, courseId)

    if (!hasAccess) {
      return c.json({ error: 'No tienes acceso a este curso' }, 403)
    }

    const now = new Date().toISOString()

    // Upsert notes
    await c.env.DB.prepare(`
      INSERT INTO student_progress (user_id, lesson_id, course_id, notes, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id, lesson_id) 
      DO UPDATE SET notes = excluded.notes, updated_at = excluded.updated_at
    `).bind(user.id, lessonId, courseId, notes, now).run()

    return c.json({ success: true })
  } catch (error) {
    console.error('Error al guardar notas:', error)
    return c.json({ error: 'Error al guardar notas' }, 500)
  }
})

// API: Actualizar posición del video
app.post('/api/lessons/:lessonId/progress', async (c) => {
  try {
    const { getCurrentUser } = await import('./auth-utils')
    const user = await getCurrentUser(c)

    if (!user) {
      return c.json({ error: 'No autenticado' }, 401)
    }

    const lessonId = parseInt(c.req.param('lessonId'))
    const { position, duration, courseId } = await c.req.json()

    // Verificar acceso
    const { userHasAccess } = await import('./auth-utils')
    const hasAccess = await userHasAccess(c.env.DB, user.id, courseId)

    if (!hasAccess) {
      return c.json({ error: 'No tienes acceso a este curso' }, 403)
    }

    const now = new Date().toISOString()
    const progressPercentage = duration > 0 ? Math.min(100, Math.round((position / duration) * 100)) : 0

    // Upsert progress
    await c.env.DB.prepare(`
      INSERT INTO student_progress (user_id, lesson_id, course_id, last_position, progress_percentage, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, lesson_id) 
      DO UPDATE SET 
        last_position = excluded.last_position,
        progress_percentage = CASE WHEN completed = 0 THEN excluded.progress_percentage ELSE progress_percentage END,
        updated_at = excluded.updated_at
    `).bind(user.id, lessonId, courseId, Math.round(position), progressPercentage, now).run()

    return c.json({ success: true })
  } catch (error) {
    console.error('Error al actualizar progreso:', error)
    return c.json({ error: 'Error al actualizar progreso' }, 500)
  }
})

// ===== SISTEMA DE CERTIFICADOS =====

// Helper: Generar código único de certificado
function generateCertificateCode() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `CERT-${timestamp}-${random}`
}

// API: Generar certificado (se llama automáticamente al completar curso)
async function generateCertificate(db: D1Database, userId: number, courseId: number, enrollmentId: number) {
  try {
    // Verificar si ya existe certificado
    const existing = await db.prepare(`
      SELECT * FROM certificates WHERE user_id = ? AND course_id = ?
    `).bind(userId, courseId).first()

    if (existing) {
      return existing.id
    }

    // Generar código único
    const certificateCode = generateCertificateCode()

    // Crear certificado
    const result = await db.prepare(`
      INSERT INTO certificates (user_id, course_id, enrollment_id, certificate_code, issue_date, verified)
      VALUES (?, ?, ?, ?, ?, 1)
    `).bind(userId, courseId, enrollmentId, certificateCode, new Date().toISOString()).run()

    return result.meta.last_row_id
  } catch (error) {
    console.error('Error generando certificado:', error)
    return null
  }
}

// Página: Ver Certificado
app.get('/certificado/:certificateId', async (c) => {
  try {
    const { getCurrentUser } = await import('./auth-utils')
    const user = await getCurrentUser(c)

    if (!user) {
      return c.redirect('/login')
    }

    const certificateId = parseInt(c.req.param('certificateId'))

    // Obtener certificado con información del usuario y curso
    const certificate = await c.env.DB.prepare(`
      SELECT 
        c.*,
        u.name as user_name,
        u.email as user_email,
        co.title as course_title,
        co.subtitle as course_subtitle,
        co.duration_weeks,
        pe.enrolled_at,
        pe.completion_date
      FROM certificates c
      JOIN users u ON c.user_id = u.id
      JOIN courses co ON c.course_id = co.id
      JOIN paid_enrollments pe ON c.enrollment_id = pe.id
      WHERE c.id = ? AND c.user_id = ?
    `).bind(certificateId, user.id).first()

    if (!certificate) {
      return c.render(
        <div>
          <section className="section">
            <div className="container text-center">
              <h1>Certificado no encontrado</h1>
              <p>No tienes acceso a este certificado o no existe.</p>
              <a href="/mi-aprendizaje" className="btn btn-primary">Volver a Mis Cursos</a>
            </div>
          </section>
        </div>
      )
    }

    const issueDate = new Date(certificate.issue_date)
    const completionDate = certificate.completion_date ? new Date(certificate.completion_date) : issueDate

    return c.render(
      <div>
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            .no-print { display: none !important; }
            .certificate-container { box-shadow: none; margin: 0; padding: 0; }
            body { background: white; }
          }
          .certificate-container {
            max-width: 1000px;
            margin: 40px auto;
            background: white;
            padding: 60px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            border: 10px solid #8b5cf6;
            border-radius: 8px;
            position: relative;
          }
          .certificate-border {
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 2px solid #d4b5ff;
            pointer-events: none;
          }
          .certificate-header {
            text-align: center;
            margin-bottom: 40px;
            position: relative;
            z-index: 1;
          }
          .certificate-logo {
            font-size: 4rem;
            color: #8b5cf6;
            margin-bottom: 20px;
          }
          .certificate-title {
            font-size: 3rem;
            font-weight: 900;
            color: #1e293b;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 10px;
          }
          .certificate-subtitle {
            font-size: 1.2rem;
            color: #64748b;
            font-weight: 300;
          }
          .certificate-body {
            text-align: center;
            margin: 50px 0;
            position: relative;
            z-index: 1;
          }
          .certificate-text {
            font-size: 1.3rem;
            color: #475569;
            margin-bottom: 30px;
            line-height: 1.8;
          }
          .recipient-name {
            font-size: 3.5rem;
            font-weight: 700;
            color: #8b5cf6;
            margin: 30px 0;
            font-family: 'Georgia', serif;
            border-bottom: 3px solid #8b5cf6;
            display: inline-block;
            padding-bottom: 10px;
          }
          .course-name {
            font-size: 2rem;
            font-weight: 600;
            color: #1e293b;
            margin: 30px 0;
          }
          .certificate-footer {
            display: flex;
            justify-content: space-around;
            margin-top: 60px;
            padding-top: 40px;
            border-top: 2px solid #e2e8f0;
            position: relative;
            z-index: 1;
          }
          .signature-block {
            text-align: center;
          }
          .signature-line {
            width: 250px;
            border-bottom: 2px solid #1e293b;
            margin: 20px auto 10px;
          }
          .signature-label {
            font-weight: 600;
            color: #1e293b;
            font-size: 1rem;
          }
          .certificate-meta {
            text-align: center;
            margin-top: 40px;
            color: #64748b;
            font-size: 0.9rem;
            position: relative;
            z-index: 1;
          }
          .verification-code {
            display: inline-block;
            background: #f8fafc;
            padding: 10px 20px;
            border-radius: 6px;
            font-family: monospace;
            font-weight: 600;
            color: #8b5cf6;
            border: 2px solid #e2e8f0;
            margin-top: 10px;
          }
          .action-buttons {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background: #f8fafc;
            border-radius: 8px;
          }
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 15rem;
            color: #f8fafc;
            opacity: 0.3;
            font-weight: 900;
            z-index: 0;
            pointer-events: none;
          }
        `}} />

        <div className="action-buttons no-print">
          <button onclick="window.print()" className="btn btn-primary btn-lg">
            <i className="fas fa-print"></i> Imprimir Certificado
          </button>
          <a href="/mi-aprendizaje" className="btn btn-secondary btn-lg" style="margin-left: 15px;">
            <i className="fas fa-arrow-left"></i> Volver a Mis Cursos
          </a>
          <button onclick="downloadPDF()" className="btn btn-secondary btn-lg" style="margin-left: 15px;">
            <i className="fas fa-download"></i> Descargar PDF
          </button>
        </div>

        <div className="certificate-container">
          <div className="certificate-border"></div>
          <div className="watermark">★</div>

          <div className="certificate-header">
            <div className="certificate-logo">
              <i className="fas fa-brain"></i>
            </div>
            <h1 className="certificate-title">Certificado de Finalización</h1>
            <p className="certificate-subtitle">Más Allá del Miedo</p>
          </div>

          <div className="certificate-body">
            <p className="certificate-text">
              Por medio del presente se certifica que
            </p>

            <div className="recipient-name">{certificate.user_name}</div>

            <p className="certificate-text">
              ha completado satisfactoriamente el curso
            </p>

            <div className="course-name">{certificate.course_title}</div>

            {certificate.course_subtitle && (
              <p className="certificate-text" style="font-size: 1.1rem; color: #64748b;">
                {certificate.course_subtitle}
              </p>
            )}

            <p className="certificate-text" style="margin-top: 40px;">
              Duración: {certificate.duration_weeks} semanas<br/>
              Fecha de finalización: {completionDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="certificate-footer">
            <div className="signature-block">
              <div className="signature-line"></div>
              <p className="signature-label">Ernesto Alvarez</p>
              <p style="color: #64748b; font-size: 0.9rem;">Autor y Facilitador</p>
            </div>

            <div className="signature-block">
              <div className="signature-line"></div>
              <p className="signature-label">Más Allá del Miedo</p>
              <p style="color: #64748b; font-size: 0.9rem;">Plataforma Educativa</p>
            </div>
          </div>

          <div className="certificate-meta">
            <p>Código de Verificación</p>
            <div className="verification-code">{certificate.certificate_code}</div>
            <p style="margin-top: 20px; font-size: 0.85rem;">
              Verifica la autenticidad de este certificado en:<br/>
              <strong>https://masalladelmiedo.com/verificar/{certificate.certificate_code}</strong>
            </p>
            <p style="margin-top: 20px; font-size: 0.8rem; color: #94a3b8;">
              Emitido el {issueDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        <script dangerouslySetInnerHTML={{__html: `
          function downloadPDF() {
            // En producción, esto llamaría a una API para generar PDF
            // Por ahora, simplemente imprime
            alert('Usa el botón de imprimir y selecciona "Guardar como PDF" en tu navegador.');
            window.print();
          }
        `}} />
      </div>
    )
  } catch (error) {
    console.error('Error al cargar certificado:', error)
    return c.render(
      <div>
        <section className="section">
          <div className="container text-center">
            <h1>Error al cargar el certificado</h1>
            <p>Por favor, intenta de nuevo más tarde.</p>
            <a href="/mi-aprendizaje" className="btn btn-primary">Volver a Mis Cursos</a>
          </div>
        </section>
      </div>
    )
  }
})

// Página: Verificar Certificado (pública)
app.get('/verificar/:code', async (c) => {
  try {
    const code = c.req.param('code')

    const certificate = await c.env.DB.prepare(`
      SELECT 
        c.*,
        u.name as user_name,
        co.title as course_title,
        co.subtitle as course_subtitle,
        co.duration_weeks
      FROM certificates c
      JOIN users u ON c.user_id = u.id
      JOIN courses co ON c.course_id = co.id
      WHERE c.certificate_code = ? AND c.verified = 1
    `).bind(code).first()

    const isValid = !!certificate

    return c.render(
      <div>
        <section className="hero hero-small">
          <div className="container">
            <h1>Verificación de Certificado</h1>
            <p className="lead">Comprueba la autenticidad de un certificado</p>
          </div>
        </section>

        <section className="section">
          <div className="container" style="max-width: 800px;">
            <div style={`background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; border-top: 5px solid ${isValid ? '#10b981' : '#ef4444'}`}>
              {isValid ? (
                <>
                  <i className="fas fa-check-circle fa-5x" style="color: #10b981; margin-bottom: 20px;"></i>
                  <h2 style="color: #10b981; margin-bottom: 20px;">✓ Certificado Válido</h2>
                  <p style="color: #64748b; font-size: 1.1rem; margin-bottom: 30px;">
                    Este certificado es auténtico y ha sido emitido por Más Allá del Miedo.
                  </p>

                  <div style="background: #f8fafc; padding: 30px; border-radius: 8px; text-align: left; margin: 30px 0;">
                    <h3 style="color: #1e293b; margin-bottom: 20px;">Detalles del Certificado</h3>
                    <div style="display: grid; gap: 15px;">
                      <div>
                        <strong style="color: #64748b;">Estudiante:</strong>
                        <p style="font-size: 1.2rem; color: #1e293b; margin: 5px 0 0 0;">{certificate.user_name}</p>
                      </div>
                      <div>
                        <strong style="color: #64748b;">Curso:</strong>
                        <p style="font-size: 1.2rem; color: #1e293b; margin: 5px 0 0 0;">{certificate.course_title}</p>
                      </div>
                      {certificate.course_subtitle && (
                        <div>
                          <strong style="color: #64748b;">Descripción:</strong>
                          <p style="color: #475569; margin: 5px 0 0 0;">{certificate.course_subtitle}</p>
                        </div>
                      )}
                      <div>
                        <strong style="color: #64748b;">Duración:</strong>
                        <p style="color: #475569; margin: 5px 0 0 0;">{certificate.duration_weeks} semanas</p>
                      </div>
                      <div>
                        <strong style="color: #64748b;">Fecha de Emisión:</strong>
                        <p style="color: #475569; margin: 5px 0 0 0;">
                          {new Date(certificate.issue_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <strong style="color: #64748b;">Código de Verificación:</strong>
                        <p style="font-family: monospace; color: #8b5cf6; font-weight: 600; margin: 5px 0 0 0;">{certificate.certificate_code}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <i className="fas fa-times-circle fa-5x" style="color: #ef4444; margin-bottom: 20px;"></i>
                  <h2 style="color: #ef4444; margin-bottom: 20px;">✗ Certificado No Válido</h2>
                  <p style="color: #64748b; font-size: 1.1rem; margin-bottom: 30px;">
                    El código de verificación ingresado no corresponde a ningún certificado válido en nuestro sistema.
                  </p>
                  <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444;">
                    <p style="color: #991b1b; margin: 0;">
                      <strong>Código buscado:</strong> <code>{code}</code>
                    </p>
                    <p style="color: #7f1d1d; margin: 10px 0 0 0; font-size: 0.9rem;">
                      Por favor, verifica que hayas ingresado el código correctamente.
                    </p>
                  </div>
                </>
              )}

              <div style="margin-top: 40px;">
                <a href="/" className="btn btn-primary">
                  <i className="fas fa-home"></i> Volver al Inicio
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  } catch (error) {
    console.error('Error al verificar certificado:', error)
    return c.render(
      <div>
        <section className="section">
          <div className="container text-center">
            <h1>Error al verificar el certificado</h1>
            <p>Por favor, intenta de nuevo más tarde.</p>
            <a href="/" className="btn btn-primary">Volver al Inicio</a>
          </div>
        </section>
      </div>
    )
  }
})

// ===== SISTEMA DE QUIZZES =====

// Página: Tomar Quiz
app.get('/cursos/:courseSlug/quiz/:quizId', async (c) => {
  try {
    const { getCurrentUser, userHasAccess } = await import('./auth-utils')
    const user = await getCurrentUser(c)

    if (!user) {
      return c.redirect('/login')
    }

    const courseSlug = c.req.param('courseSlug')
    const quizId = parseInt(c.req.param('quizId'))

    // Obtener información del curso
    const course = await c.env.DB.prepare(`
      SELECT id, title, slug FROM courses WHERE slug = ? AND published = 1
    `).bind(courseSlug).first()

    if (!course) {
      return c.render(
        <div>
          <section className="section">
            <div className="container text-center">
              <h1>Curso no encontrado</h1>
              <a href="/cursos" className="btn btn-primary">Ver Cursos</a>
            </div>
          </section>
        </div>
      )
    }

    // Verificar acceso al curso
    const hasAccess = await userHasAccess(c.env.DB, user.id, course.id)
    
    if (!hasAccess) {
      return c.render(
        <div>
          <section className="section">
            <div className="container text-center">
              <i className="fas fa-lock fa-3x" style="color: #f59e0b; margin-bottom: 20px;"></i>
              <h1>Acceso Restringido</h1>
              <p className="lead">Necesitas estar inscrito en este curso para tomar esta evaluación.</p>
              <a href={`/cursos/${courseSlug}`} className="btn btn-primary">Ver Curso</a>
            </div>
          </section>
        </div>
      )
    }

    // Obtener información del quiz
    const quiz = await c.env.DB.prepare(`
      SELECT * FROM quizzes WHERE id = ? AND course_id = ? AND published = 1
    `).bind(quizId, course.id).first()

    if (!quiz) {
      return c.render(
        <div>
          <section className="section">
            <div className="container text-center">
              <h1>Evaluación no encontrada</h1>
              <a href="/mi-aprendizaje" className="btn btn-primary">Volver a Mis Cursos</a>
            </div>
          </section>
        </div>
      )
    }

    // Verificar intentos previos
    const attempts = await c.env.DB.prepare(`
      SELECT * FROM quiz_attempts 
      WHERE quiz_id = ? AND user_id = ? 
      ORDER BY started_at DESC
    `).bind(quizId, user.id).all()

    const attemptCount = attempts.results?.length || 0
    const lastAttempt = attempts.results?.[0]
    const canRetake = !quiz.max_attempts || attemptCount < quiz.max_attempts

    // Si ya completó y pasó, mostrar resultados
    if (lastAttempt && lastAttempt.passed && !canRetake) {
      return c.redirect(`/cursos/${courseSlug}/quiz/${quizId}/resultado/${lastAttempt.id}`)
    }

    // Obtener preguntas con opciones
    const questions = await c.env.DB.prepare(`
      SELECT * FROM quiz_questions 
      WHERE quiz_id = ? 
      ORDER BY ${quiz.randomize_questions ? 'RANDOM()' : 'order_index ASC'}
    `).bind(quizId).all()

    const questionsWithOptions = await Promise.all(
      (questions.results || []).map(async (q: any) => {
        const options = await c.env.DB.prepare(`
          SELECT id, option_text, order_index FROM quiz_options 
          WHERE question_id = ? 
          ORDER BY ${quiz.randomize_options ? 'RANDOM()' : 'order_index ASC'}
        `).bind(q.id).all()
        
        return {
          ...q,
          options: options.results || []
        }
      })
    )

    const totalPoints = questionsWithOptions.reduce((sum, q: any) => sum + q.points, 0)

    return c.render(
      <div>
        <style dangerouslySetInnerHTML={{__html: `
          .quiz-container {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
          }
          .quiz-header {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .quiz-info {
            display: flex;
            gap: 30px;
            margin-top: 20px;
            flex-wrap: wrap;
          }
          .quiz-info-item {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #64748b;
          }
          .question-card {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .question-number {
            background: #8b5cf6;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            margin-bottom: 15px;
          }
          .option-item {
            padding: 15px 20px;
            margin: 10px 0;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 15px;
          }
          .option-item:hover {
            border-color: #8b5cf6;
            background: #f5f3ff;
          }
          .option-item input[type="radio"],
          .option-item input[type="checkbox"] {
            width: 20px;
            height: 20px;
            cursor: pointer;
          }
          .option-item.selected {
            border-color: #8b5cf6;
            background: #ede9fe;
          }
          .quiz-timer {
            position: fixed;
            top: 80px;
            right: 20px;
            background: white;
            padding: 15px 20px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            z-index: 100;
          }
          .timer-display {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1e293b;
          }
          .timer-display.warning {
            color: #f59e0b;
          }
          .timer-display.danger {
            color: #ef4444;
            animation: pulse 1s infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          @media (max-width: 768px) {
            .quiz-timer {
              position: static;
              margin-bottom: 20px;
            }
          }
        `}} />

        <div className="quiz-container">
          {/* Header */}
          <div style="display: flex; align-items: center; gap: 10px; color: #64748b; margin-bottom: 20px;">
            <a href="/mi-aprendizaje" style="color: #8b5cf6; text-decoration: none;">Mis Cursos</a>
            <i className="fas fa-chevron-right" style="font-size: 12px;"></i>
            <a href={`/cursos/${courseSlug}`} style="color: #8b5cf6; text-decoration: none;">{course.title}</a>
            <i className="fas fa-chevron-right" style="font-size: 12px;"></i>
            <span>Evaluación</span>
          </div>

          <div className="quiz-header">
            <div style="display: flex; align-items: start; justify-content: space-between;">
              <div>
                <h1 style="font-size: 2rem; color: #1e293b; margin-bottom: 10px;">{quiz.title}</h1>
                {quiz.description && (
                  <p style="color: #64748b; font-size: 1.1rem; line-height: 1.6;">{quiz.description}</p>
                )}
              </div>
              <div style="text-align: right;">
                <div style="background: #ede9fe; color: #8b5cf6; padding: 8px 16px; border-radius: 20px; font-weight: 600; margin-bottom: 10px;">
                  Intento {attemptCount + 1}/{quiz.max_attempts || '∞'}
                </div>
              </div>
            </div>

            <div className="quiz-info">
              <div className="quiz-info-item">
                <i className="fas fa-list-ol" style="color: #8b5cf6;"></i>
                <span>{questionsWithOptions.length} preguntas</span>
              </div>
              <div className="quiz-info-item">
                <i className="fas fa-star" style="color: #f59e0b;"></i>
                <span>{totalPoints} puntos totales</span>
              </div>
              <div className="quiz-info-item">
                <i className="fas fa-check-circle" style="color: #10b981;"></i>
                <span>{quiz.passing_score}% para aprobar</span>
              </div>
              {quiz.time_limit && (
                <div className="quiz-info-item">
                  <i className="fas fa-clock" style="color: #ec4899;"></i>
                  <span>{quiz.time_limit} minutos</span>
                </div>
              )}
            </div>

            {attemptCount > 0 && lastAttempt && (
              <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <strong>Último intento:</strong> {lastAttempt.score.toFixed(0)}% 
                {lastAttempt.passed ? 
                  <span style="color: #10b981; margin-left: 10px;"><i className="fas fa-check-circle"></i> Aprobado</span> : 
                  <span style="color: #ef4444; margin-left: 10px;"><i className="fas fa-times-circle"></i> No aprobado</span>
                }
              </div>
            )}
          </div>

          {/* Timer */}
          {quiz.time_limit && (
            <div className="quiz-timer">
              <div style="font-size: 0.85rem; color: #64748b; margin-bottom: 5px;">
                <i className="fas fa-clock"></i> Tiempo restante
              </div>
              <div className="timer-display" id="timerDisplay">{quiz.time_limit}:00</div>
            </div>
          )}

          {/* Form */}
          <form id="quizForm">
            {questionsWithOptions.map((question: any, idx: number) => (
              <div className="question-card" key={question.id}>
                <div className="question-number">{idx + 1}</div>
                <h3 style="font-size: 1.3rem; color: #1e293b; margin-bottom: 20px; line-height: 1.6;">
                  {question.question_text}
                </h3>
                <div className="options-list">
                  {question.options.map((option: any) => (
                    <label 
                      className="option-item" 
                      key={option.id}
                      onclick="this.classList.toggle('selected')"
                    >
                      <input 
                        type={question.question_type === 'multiple_select' ? 'checkbox' : 'radio'}
                        name={`question_${question.id}`}
                        value={option.id}
                        required={idx === 0}
                      />
                      <span style="flex: 1; font-size: 1.05rem;">{option.option_text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div style="background: white; border-radius: 12px; padding: 30px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <button type="submit" className="btn btn-primary btn-lg">
                <i className="fas fa-check-circle"></i> Enviar Evaluación
              </button>
              <p style="color: #64748b; margin-top: 15px; font-size: 0.95rem;">
                Revisa tus respuestas antes de enviar. No podrás cambiarlas después.
              </p>
            </div>
          </form>
        </div>

        <script dangerouslySetInnerHTML={{__html: `
          const quizId = ${quizId};
          const courseId = ${course.id};
          const timeLimit = ${quiz.time_limit || 0};
          let timeRemaining = timeLimit * 60; // segundos
          let timerInterval;
          let startTime = Date.now();

          // Iniciar timer si hay límite de tiempo
          if (timeLimit > 0) {
            timerInterval = setInterval(() => {
              timeRemaining--;
              
              const minutes = Math.floor(timeRemaining / 60);
              const seconds = timeRemaining % 60;
              const display = minutes + ':' + seconds.toString().padStart(2, '0');
              
              const timerEl = document.getElementById('timerDisplay');
              timerEl.textContent = display;
              
              // Cambiar colores según tiempo restante
              timerEl.classList.remove('warning', 'danger');
              if (timeRemaining <= 60) {
                timerEl.classList.add('danger');
              } else if (timeRemaining <= 180) {
                timerEl.classList.add('warning');
              }
              
              // Auto-submit cuando se acaba el tiempo
              if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                alert('¡Tiempo agotado! La evaluación se enviará automáticamente.');
                document.getElementById('quizForm').dispatchEvent(new Event('submit'));
              }
            }, 1000);
          }

          // Manejar envío del formulario
          document.getElementById('quizForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (timerInterval) clearInterval(timerInterval);
            
            if (!confirm('¿Estás seguro de enviar la evaluación? No podrás cambiar tus respuestas.')) {
              if (timerInterval && timeRemaining > 0) {
                timerInterval = setInterval(() => { /* reiniciar timer */ }, 1000);
              }
              return;
            }
            
            const formData = new FormData(e.target);
            const answers = {};
            
            // Recopilar respuestas
            for (let [key, value] of formData.entries()) {
              if (key.startsWith('question_')) {
                const questionId = key.replace('question_', '');
                if (!answers[questionId]) {
                  answers[questionId] = [];
                }
                answers[questionId].push(parseInt(value));
              }
            }
            
            const timeTaken = Math.floor((Date.now() - startTime) / 1000);
            
            try {
              const submitBtn = e.target.querySelector('button[type="submit"]');
              submitBtn.disabled = true;
              submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
              
              const response = await fetch('/api/quiz/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  quizId,
                  courseId,
                  answers,
                  timeTaken
                })
              });
              
              const data = await response.json();
              
              if (data.success) {
                window.location.href = '/cursos/${courseSlug}/quiz/' + quizId + '/resultado/' + data.attemptId;
              } else {
                alert('Error: ' + (data.error || 'No se pudo enviar la evaluación'));
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Enviar Evaluación';
              }
            } catch (error) {
              console.error('Error:', error);
              alert('Error al enviar la evaluación. Por favor, intenta de nuevo.');
              const submitBtn = e.target.querySelector('button[type="submit"]');
              submitBtn.disabled = false;
              submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Enviar Evaluación';
            }
          });

          // Prevenir salida accidental
          window.addEventListener('beforeunload', (e) => {
            e.preventDefault();
            e.returnValue = '';
          });
        `}} />
      </div>
    )
  } catch (error) {
    console.error('Error al cargar quiz:', error)
    return c.render(
      <div>
        <section className="section">
          <div className="container text-center">
            <h1>Error al cargar la evaluación</h1>
            <p>Por favor, intenta de nuevo más tarde.</p>
            <a href="/mi-aprendizaje" className="btn btn-primary">Volver a Mis Cursos</a>
          </div>
        </section>
      </div>
    )
  }
})

// API: Enviar respuestas del quiz
app.post('/api/quiz/submit', async (c) => {
  try {
    const { getCurrentUser, userHasAccess } = await import('./auth-utils')
    const user = await getCurrentUser(c)

    if (!user) {
      return c.json({ error: 'No autenticado' }, 401)
    }

    const { quizId, courseId, answers, timeTaken } = await c.req.json()

    // Verificar acceso
    const hasAccess = await userHasAccess(c.env.DB, user.id, courseId)
    if (!hasAccess) {
      return c.json({ error: 'No tienes acceso a este curso' }, 403)
    }

    // Obtener quiz
    const quiz = await c.env.DB.prepare(`
      SELECT * FROM quizzes WHERE id = ? AND course_id = ?
    `).bind(quizId, courseId).first()

    if (!quiz) {
      return c.json({ error: 'Quiz no encontrado' }, 404)
    }

    // Verificar intentos máximos
    const attemptsCount = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM quiz_attempts 
      WHERE quiz_id = ? AND user_id = ?
    `).bind(quizId, user.id).first()

    if (quiz.max_attempts && attemptsCount.count >= quiz.max_attempts) {
      return c.json({ error: 'Has alcanzado el número máximo de intentos' }, 403)
    }

    // Obtener todas las preguntas con respuestas correctas
    const questions = await c.env.DB.prepare(`
      SELECT * FROM quiz_questions WHERE quiz_id = ?
    `).bind(quizId).all()

    let totalPoints = 0
    let earnedPoints = 0
    const questionResults = []

    for (const question of (questions.results || [])) {
      totalPoints += question.points

      // Obtener respuestas correctas
      const correctOptions = await c.env.DB.prepare(`
        SELECT id FROM quiz_options WHERE question_id = ? AND is_correct = 1
      `).bind(question.id).all()

      const correctIds = new Set((correctOptions.results || []).map((o: any) => o.id))
      const userAnswers = answers[question.id] || []
      const userAnswerSet = new Set(userAnswers)

      // Verificar si es correcta (debe seleccionar todas las correctas y ninguna incorrecta)
      const isCorrect = 
        correctIds.size === userAnswerSet.size &&
        [...correctIds].every(id => userAnswerSet.has(id))

      if (isCorrect) {
        earnedPoints += question.points
      }

      questionResults.push({
        questionId: question.id,
        selectedOptions: userAnswers,
        isCorrect,
        pointsEarned: isCorrect ? question.points : 0
      })
    }

    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
    const passed = score >= quiz.passing_score
    const now = new Date().toISOString()

    // Crear intento
    const attemptResult = await c.env.DB.prepare(`
      INSERT INTO quiz_attempts (
        quiz_id, user_id, course_id, score, points_earned, 
        total_points, passed, time_taken, started_at, completed_at, answers
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      quizId,
      user.id,
      courseId,
      score,
      earnedPoints,
      totalPoints,
      passed ? 1 : 0,
      timeTaken,
      now,
      now,
      JSON.stringify(answers)
    ).run()

    const attemptId = attemptResult.meta.last_row_id

    // Guardar respuestas individuales
    for (const result of questionResults) {
      await c.env.DB.prepare(`
        INSERT INTO quiz_answers (
          attempt_id, question_id, selected_options, is_correct, points_earned
        )
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        attemptId,
        result.questionId,
        JSON.stringify(result.selectedOptions),
        result.isCorrect ? 1 : 0,
        result.pointsEarned
      ).run()
    }

    return c.json({
      success: true,
      attemptId,
      score,
      passed,
      earnedPoints,
      totalPoints
    })
  } catch (error) {
    console.error('Error al enviar quiz:', error)
    return c.json({ error: 'Error al procesar la evaluación' }, 500)
  }
})

// Página: Resultado del Quiz
app.get('/cursos/:courseSlug/quiz/:quizId/resultado/:attemptId', async (c) => {
  try {
    const { getCurrentUser } = await import('./auth-utils')
    const user = await getCurrentUser(c)

    if (!user) {
      return c.redirect('/login')
    }

    const courseSlug = c.req.param('courseSlug')
    const quizId = parseInt(c.req.param('quizId'))
    const attemptId = parseInt(c.req.param('attemptId'))

    // Obtener curso
    const course = await c.env.DB.prepare(`
      SELECT id, title, slug FROM courses WHERE slug = ?
    `).bind(courseSlug).first()

    if (!course) {
      return c.render(<div><section className="section"><div className="container text-center"><h1>Curso no encontrado</h1></div></section></div>)
    }

    // Obtener intento
    const attempt = await c.env.DB.prepare(`
      SELECT * FROM quiz_attempts 
      WHERE id = ? AND user_id = ? AND quiz_id = ?
    `).bind(attemptId, user.id, quizId).first()

    if (!attempt) {
      return c.render(<div><section className="section"><div className="container text-center"><h1>Resultado no encontrado</h1></div></section></div>)
    }

    // Obtener quiz
    const quiz = await c.env.DB.prepare(`
      SELECT * FROM quizzes WHERE id = ?
    `).bind(quizId).first()

    // Obtener respuestas detalladas
    const answers = await c.env.DB.prepare(`
      SELECT 
        qa.*,
        qq.question_text,
        qq.question_type,
        qq.explanation,
        qq.points
      FROM quiz_answers qa
      JOIN quiz_questions qq ON qa.question_id = qq.id
      WHERE qa.attempt_id = ?
      ORDER BY qq.order_index ASC
    `).bind(attemptId).all()

    // Obtener opciones para cada pregunta
    const detailedAnswers = await Promise.all(
      (answers.results || []).map(async (answer: any) => {
        const options = await c.env.DB.prepare(`
          SELECT * FROM quiz_options WHERE question_id = ? ORDER BY order_index
        `).bind(answer.question_id).all()

        const selectedIds = JSON.parse(answer.selected_options)
        
        return {
          ...answer,
          options: options.results || [],
          selectedIds
        }
      })
    )

    return c.render(
      <div>
        <style dangerouslySetInnerHTML={{__html: `
          .result-container {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
          }
          .result-header {
            background: white;
            border-radius: 12px;
            padding: 40px;
            margin-bottom: 30px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            text-align: center;
          }
          .score-circle {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 2.5rem;
            font-weight: 700;
            position: relative;
          }
          .score-circle.passed {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
          }
          .score-circle.failed {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
          }
          .result-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 30px;
          }
          .stat-card {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
          }
          .answer-review {
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .answer-review.correct {
            border-left: 4px solid #10b981;
          }
          .answer-review.incorrect {
            border-left: 4px solid #ef4444;
          }
          .option-review {
            padding: 12px 15px;
            margin: 8px 0;
            border-radius: 6px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .option-review.correct {
            background: #dcfce7;
            border: 2px solid #10b981;
          }
          .option-review.incorrect {
            background: #fee2e2;
            border: 2px solid #ef4444;
          }
          .option-review.not-selected {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
          }
          .explanation-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin-top: 15px;
            border-radius: 4px;
          }
        `}} />

        <div className="result-container">
          <div style="display: flex; align-items: center; gap: 10px; color: #64748b; margin-bottom: 20px;">
            <a href="/mi-aprendizaje" style="color: #8b5cf6; text-decoration: none;">Mis Cursos</a>
            <i className="fas fa-chevron-right" style="font-size: 12px;"></i>
            <a href={`/cursos/${courseSlug}`} style="color: #8b5cf6; text-decoration: none;">{course.title}</a>
            <i className="fas fa-chevron-right" style="font-size: 12px;"></i>
            <span>Resultado de Evaluación</span>
          </div>

          <div className="result-header">
            <div className={`score-circle ${attempt.passed ? 'passed' : 'failed'}`}>
              <div>{attempt.score.toFixed(0)}%</div>
              <div style="font-size: 0.9rem; font-weight: 400;">{attempt.passed ? 'Aprobado' : 'No Aprobado'}</div>
            </div>

            <h1 style="font-size: 2rem; color: #1e293b; margin-bottom: 10px;">{quiz.title}</h1>
            
            {attempt.passed ? (
              <p style="color: #10b981; font-size: 1.2rem; font-weight: 600;">
                <i className="fas fa-check-circle"></i> ¡Felicitaciones! Has aprobado la evaluación
              </p>
            ) : (
              <p style="color: #ef4444; font-size: 1.2rem; font-weight: 600;">
                <i className="fas fa-times-circle"></i> No alcanzaste el puntaje mínimo de {quiz.passing_score}%
              </p>
            )}

            <div className="result-stats">
              <div className="stat-card">
                <i className="fas fa-star fa-2x" style="color: #f59e0b; margin-bottom: 10px;"></i>
                <div style="font-size: 1.5rem; font-weight: 700; color: #1e293b;">{attempt.points_earned}/{attempt.total_points}</div>
                <div style="color: #64748b; font-size: 0.9rem;">Puntos Obtenidos</div>
              </div>
              <div className="stat-card">
                <i className="fas fa-clock fa-2x" style="color: #8b5cf6; margin-bottom: 10px;"></i>
                <div style="font-size: 1.5rem; font-weight: 700; color: #1e293b;">{Math.floor(attempt.time_taken / 60)}:{(attempt.time_taken % 60).toString().padStart(2, '0')}</div>
                <div style="color: #64748b; font-size: 0.9rem;">Tiempo Tomado</div>
              </div>
              <div className="stat-card">
                <i className="fas fa-check-circle fa-2x" style="color: #10b981; margin-bottom: 10px;"></i>
                <div style="font-size: 1.5rem; font-weight: 700; color: #1e293b;">{detailedAnswers.filter((a: any) => a.is_correct).length}/{detailedAnswers.length}</div>
                <div style="color: #64748b; font-size: 0.9rem;">Respuestas Correctas</div>
              </div>
            </div>

            <div style="margin-top: 30px; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
              <a href={`/cursos/${courseSlug}`} className="btn btn-primary">
                <i className="fas fa-arrow-left"></i> Volver al Curso
              </a>
              {!attempt.passed && quiz.max_attempts && attempt.attempt_count < quiz.max_attempts && (
                <a href={`/cursos/${courseSlug}/quiz/${quizId}`} className="btn btn-secondary">
                  <i className="fas fa-redo"></i> Intentar de Nuevo
                </a>
              )}
            </div>
          </div>

          {quiz.show_correct_answers && (
            <div>
              <h2 style="font-size: 1.5rem; color: #1e293b; margin-bottom: 20px;">
                <i className="fas fa-list-alt"></i> Revisión de Respuestas
              </h2>

              {detailedAnswers.map((answer: any, idx: number) => (
                <div className={`answer-review ${answer.is_correct ? 'correct' : 'incorrect'}`} key={answer.question_id}>
                  <div style="display: flex; align-items: start; justify-content: space-between; margin-bottom: 15px;">
                    <div style="display: flex; gap: 15px; align-items: start; flex: 1;">
                      <div style={`font-size: 1.5rem; ${answer.is_correct ? 'color: #10b981' : 'color: #ef4444'}`}>
                        {answer.is_correct ? <i className="fas fa-check-circle"></i> : <i className="fas fa-times-circle"></i>}
                      </div>
                      <div style="flex: 1;">
                        <div style="font-weight: 600; color: #64748b; margin-bottom: 5px;">Pregunta {idx + 1}</div>
                        <h3 style="font-size: 1.2rem; color: #1e293b; margin-bottom: 15px;">{answer.question_text}</h3>

                        {answer.options.map((option: any) => {
                          const isSelected = answer.selectedIds.includes(option.id)
                          const isCorrect = option.is_correct
                          
                          let className = 'option-review'
                          if (isCorrect) {
                            className += ' correct'
                          } else if (isSelected) {
                            className += ' incorrect'
                          } else {
                            className += ' not-selected'
                          }

                          return (
                            <div className={className} key={option.id}>
                              {isCorrect && <i className="fas fa-check" style="color: #10b981;"></i>}
                              {!isCorrect && isSelected && <i className="fas fa-times" style="color: #ef4444;"></i>}
                              {!isCorrect && !isSelected && <i className="far fa-circle" style="color: #94a3b8;"></i>}
                              <span>{option.option_text}</span>
                            </div>
                          )
                        })}

                        {answer.explanation && (
                          <div className="explanation-box">
                            <strong style="color: #d97706;"><i className="fas fa-lightbulb"></i> Explicación:</strong>
                            <p style="margin: 5px 0 0 0; color: #78350f;">{answer.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div style="text-align: right;">
                      <div style={`font-weight: 700; font-size: 1.1rem; ${answer.is_correct ? 'color: #10b981' : 'color: #ef4444'}`}>
                        {answer.points_earned}/{answer.points} pts
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error al cargar resultado:', error)
    return c.render(
      <div>
        <section className="section">
          <div className="container text-center">
            <h1>Error al cargar el resultado</h1>
            <p>Por favor, intenta de nuevo más tarde.</p>
            <a href="/mi-aprendizaje" className="btn btn-primary">Volver a Mis Cursos</a>
          </div>
        </section>
      </div>
    )
  }
})

// ===== RUTAS DEL BLOG =====

// Página: Listado de Blog
app.get('/blog', async (c) => {
  try {
    // Obtener parámetros de paginación
    const page = parseInt(c.req.query('page') || '1')
    const limit = 12
    const offset = (page - 1) * limit

    // Obtener posts
    const postsResult = await c.env.DB.prepare(`
      SELECT id, title, slug, excerpt, hashtags, image_url, created_at
      FROM blog_posts
      WHERE published = 1 AND (scheduled_at IS NULL OR scheduled_at <= datetime('now'))
      ORDER BY COALESCE(scheduled_at, created_at) DESC
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all()

    // Contar total de posts
    const countResult = await c.env.DB.prepare(`
      SELECT COUNT(*) as total FROM blog_posts
      WHERE published = 1 AND (scheduled_at IS NULL OR scheduled_at <= datetime('now'))
    `).first()

    const posts = postsResult.results || []
    const total = countResult?.total || 0
    const totalPages = Math.ceil(total / limit)

    return c.render(
      <div>
        <section className="hero hero-small">
          <div className="container">
            <h1>Blog: Más Allá del Miedo</h1>
            <p className="lead">
              Artículos, herramientas y reflexiones para tu crecimiento emocional
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="blog-grid">
              {posts.map((post: any) => (
                <article className="blog-card" key={post.id}>
                  <div className="blog-card-image">
                    <img src={post.image_url || 'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=800'} alt={post.title} />
                  </div>
                  <div className="blog-card-content">
                    <div className="blog-card-meta">
                      <span className="blog-date">
                        <i className="fas fa-calendar"></i> {new Date(post.created_at).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <h2 className="blog-card-title">
                      <a href={`/blog/${post.slug}`}>{post.title}</a>
                    </h2>
                    <p className="blog-card-excerpt">{post.excerpt}</p>
                    <div className="blog-card-tags">
                      {post.hashtags?.split(' ').slice(0, 3).map((tag: string, idx: number) => (
                        <span className="tag" key={idx}>{tag}</span>
                      ))}
                    </div>
                    <a href={`/blog/${post.slug}`} className="btn btn-sm">
                      Leer más <i className="fas fa-arrow-right"></i>
                    </a>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                {page > 1 && (
                  <a href={`/blog?page=${page - 1}`} className="btn btn-secondary">
                    <i className="fas fa-chevron-left"></i> Anterior
                  </a>
                )}
                <span className="pagination-info">
                  Página {page} de {totalPages}
                </span>
                {page < totalPages && (
                  <a href={`/blog?page=${page + 1}`} className="btn btn-secondary">
                    Siguiente <i className="fas fa-chevron-right"></i>
                  </a>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="section bg-light">
          <div className="container text-center">
            <h2>¿Quieres más contenido exclusivo?</h2>
            <p className="lead">
              Suscríbete a nuestra newsletter y recibe recursos gratuitos cada semana
            </p>
            <form action="/api/subscribe" method="post" className="subscribe-form-inline">
              <input type="hidden" name="resource" value="newsletter" />
              <input type="text" name="name" placeholder="Tu nombre" required />
              <input type="email" name="email" placeholder="Tu email" required />
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-paper-plane"></i> Suscribirme
              </button>
            </form>
          </div>
        </section>
      </div>
    )
  } catch (error) {
    console.error('Error al cargar blog:', error)
    return c.render(
      <div>
        <section className="section">
          <div className="container text-center">
            <h1>Error al cargar el blog</h1>
            <p>Por favor, intenta de nuevo más tarde.</p>
            <a href="/" className="btn btn-primary">Volver al inicio</a>
          </div>
        </section>
      </div>
    )
  }
})

// Página: Post Individual
app.get('/blog/:slug', async (c) => {
  try {
    const slug = c.req.param('slug')

    // Obtener el post
    const post = await c.env.DB.prepare(`
      SELECT * FROM blog_posts
      WHERE slug = ? AND published = 1 AND (scheduled_at IS NULL OR scheduled_at <= datetime('now'))
    `).bind(slug).first()

    if (!post) {
      return c.render(
        <div>
          <section className="section">
            <div className="container text-center">
              <h1>Post no encontrado</h1>
              <p>El artículo que buscas no existe o ha sido eliminado.</p>
              <a href="/blog" className="btn btn-primary">Ver todos los posts</a>
            </div>
          </section>
        </div>
      )
    }

    // Incrementar contador de vistas
    await c.env.DB.prepare(`
      UPDATE blog_posts SET views = views + 1 WHERE id = ?
    `).bind(post.id).run()

    // Obtener posts relacionados
    const relatedPosts = await c.env.DB.prepare(`
      SELECT id, title, slug, excerpt, image_url
      FROM blog_posts
      WHERE published = 1 AND id != ?
      ORDER BY RANDOM()
      LIMIT 3
    `).bind(post.id).all()

    return c.render(
      <div>
        <article className="blog-post">
          <header className="blog-post-header">
            <div className="container">
              <div className="blog-post-meta">
                <span><i className="fas fa-calendar"></i> {new Date(post.created_at).toLocaleDateString('es-ES')}</span>
                <span><i className="fas fa-eye"></i> {post.views || 0} vistas</span>
              </div>
              <h1 className="blog-post-title">{post.title}</h1>
              <div className="blog-post-tags">
                {post.hashtags?.split(' ').map((tag: string, idx: number) => (
                  <span className="tag" key={idx}>{tag}</span>
                ))}
              </div>
            </div>
          </header>

          <div className="blog-post-featured-image">
            <img src={post.image_url || 'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=1200'} alt={post.title} />
          </div>

          <div className="blog-post-content">
            <div className="container">
              <div className="blog-post-body">
                {post.content.split('\n\n').map((paragraph: string, idx: number) => (
                  <div key={idx}>
                    {paragraph.startsWith('**') ? (
                      <h3 dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*/g, '') }}></h3>
                    ) : (
                      <p dangerouslySetInnerHTML={{ __html: paragraph }}></p>
                    )}
                  </div>
                ))}
              </div>

              <div className="blog-post-footer">
                <div className="blog-post-share">
                  <h3>Comparte este artículo</h3>
                  <div className="share-buttons">
                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent('https://mas-alla-del-miedo.pages.dev/blog/' + slug)}`} target="_blank" className="btn btn-sm">
                      <i className="fab fa-twitter"></i> Twitter
                    </a>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://mas-alla-del-miedo.pages.dev/blog/' + slug)}`} target="_blank" className="btn btn-sm">
                      <i className="fab fa-facebook"></i> Facebook
                    </a>
                    <a href={`https://wa.me/?text=${encodeURIComponent(post.title + ' https://mas-alla-del-miedo.pages.dev/blog/' + slug)}`} target="_blank" className="btn btn-sm">
                      <i className="fab fa-whatsapp"></i> WhatsApp
                    </a>
                  </div>
                </div>

                <div className="blog-post-cta">
                  <h3>¿Te gustó este artículo?</h3>
                  <p>Descarga recursos gratuitos y sigue aprendiendo</p>
                  <a href="/recursos-gratuitos" className="btn btn-primary">
                    <i className="fas fa-download"></i> Ver recursos gratuitos
                  </a>
                </div>
              </div>
            </div>
          </div>
        </article>

        {relatedPosts.results && relatedPosts.results.length > 0 && (
          <section className="section bg-light">
            <div className="container">
              <h2 className="section-title">También te puede interesar</h2>
              <div className="blog-grid">
                {relatedPosts.results.map((related: any) => (
                  <article className="blog-card" key={related.id}>
                    <div className="blog-card-image">
                      <img src={related.image_url || 'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=800'} alt={related.title} />
                    </div>
                    <div className="blog-card-content">
                      <h3 className="blog-card-title">
                        <a href={`/blog/${related.slug}`}>{related.title}</a>
                      </h3>
                      <p className="blog-card-excerpt">{related.excerpt}</p>
                      <a href={`/blog/${related.slug}`} className="btn btn-sm">
                        Leer más <i className="fas fa-arrow-right"></i>
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    )
  } catch (error) {
    console.error('Error al cargar post:', error)
    return c.render(
      <div>
        <section className="section">
          <div className="container text-center">
            <h1>Error al cargar el artículo</h1>
            <p>Por favor, intenta de nuevo más tarde.</p>
            <a href="/blog" className="btn btn-primary">Ver todos los posts</a>
          </div>
        </section>
      </div>
    )
  }
})

// ===== RUTAS DE PAGOS Y CHECKOUT =====

// Página: Checkout
app.get('/checkout/:courseId', async (c) => {
  try {
    const courseId = parseInt(c.req.param('courseId'))
    
    // Verificar autenticación
    const { getCurrentUser } = await import('./auth-utils')
    const user = await getCurrentUser(c)

    if (!user) {
      return c.redirect(`/login?redirect=/checkout/${courseId}`)
    }

    // Obtener información del curso
    const course = await c.env.DB.prepare(`
      SELECT id, title, subtitle, price, currency, featured_image, duration_weeks, level
      FROM courses 
      WHERE id = ? AND published = 1
    `).bind(courseId).first()

    if (!course) {
      return c.redirect('/cursos')
    }

    // Verificar si ya está inscrito
    const enrollment = await c.env.DB.prepare(`
      SELECT id FROM paid_enrollments 
      WHERE user_id = ? AND course_id = ? AND payment_status = 'completed'
    `).bind(user.id, courseId).first()

    if (enrollment) {
      return c.redirect('/mi-aprendizaje')
    }

    return c.render(
      <div>
        <section className="hero hero-small">
          <div className="container">
            <h1>Checkout</h1>
            <p className="lead">Completa tu inscripción al curso</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="checkout-container" style="max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: 1fr 400px; gap: 40px;">
              
              {/* Columna izquierda: Métodos de pago */}
              <div className="payment-methods">
                <h2 style="margin-bottom: 30px;">Método de Pago</h2>
                
                <div id="checkout-message" className="auth-message" style="display: none; margin-bottom: 20px;"></div>

                {/* Selector de método de pago */}
                <div className="payment-selector" style="display: flex; gap: 15px; margin-bottom: 30px;">
                  <button 
                    id="select-stripe" 
                    className="payment-method-btn active" 
                    onclick="selectPaymentMethod('stripe')"
                    style="flex: 1; padding: 20px; border: 2px solid #8b5cf6; border-radius: 12px; background: white; cursor: pointer; transition: all 0.3s;"
                  >
                    <i className="fab fa-cc-stripe fa-2x" style="color: #635bff; margin-bottom: 10px;"></i>
                    <div style="font-weight: 600; color: #1e293b;">Tarjeta de Crédito/Débito</div>
                    <div style="font-size: 0.85rem; color: #64748b; margin-top: 5px;">Visa, Mastercard, Amex</div>
                  </button>
                  
                  <button 
                    id="select-paypal" 
                    className="payment-method-btn" 
                    onclick="selectPaymentMethod('paypal')"
                    style="flex: 1; padding: 20px; border: 2px solid #e2e8f0; border-radius: 12px; background: white; cursor: pointer; transition: all 0.3s;"
                  >
                    <i className="fab fa-paypal fa-2x" style="color: #0070ba; margin-bottom: 10px;"></i>
                    <div style="font-weight: 600; color: #1e293b;">PayPal</div>
                    <div style="font-size: 0.85rem; color: #64748b; margin-top: 5px;">Pago rápido y seguro</div>
                  </button>
                </div>

                {/* Formulario de Stripe */}
                <div id="stripe-payment" style="display: block;">
                  <div style="padding: 30px; background: #f8fafc; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="margin-bottom: 20px; color: #1e293b;">Información de Tarjeta</h3>
                    
                    <form id="payment-form">
                      <div className="form-group">
                        <label>Nombre en la tarjeta</label>
                        <input 
                          type="text" 
                          id="card-holder-name" 
                          className="form-control" 
                          placeholder="Juan Pérez"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Detalles de la tarjeta</label>
                        <div id="card-element" style="padding: 12px; background: white; border: 1px solid #e2e8f0; border-radius: 8px;">
                          {/* Stripe Elements se montará aquí */}
                        </div>
                        <div id="card-errors" role="alert" style="color: #dc2626; font-size: 0.875rem; margin-top: 8px;"></div>
                      </div>

                      <button 
                        type="submit" 
                        id="submit-stripe" 
                        className="btn btn-primary btn-lg btn-block"
                        style="margin-top: 20px;"
                      >
                        <i className="fas fa-lock"></i> Pagar ${course.price} {course.currency}
                      </button>
                    </form>

                    <div style="margin-top: 20px; text-align: center; color: #64748b; font-size: 0.85rem;">
                      <i className="fas fa-shield-alt"></i> Pago seguro encriptado por Stripe
                    </div>
                  </div>
                </div>

                {/* PayPal */}
                <div id="paypal-payment" style="display: none;">
                  <div style="padding: 30px; background: #f8fafc; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="margin-bottom: 20px; color: #1e293b;">Pagar con PayPal</h3>
                    
                    <div id="paypal-button-container" style="margin-bottom: 20px;"></div>

                    <div style="text-align: center; color: #64748b; font-size: 0.85rem;">
                      <i className="fas fa-shield-alt"></i> Serás redirigido a PayPal para completar el pago
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna derecha: Resumen del pedido */}
              <div className="order-summary">
                <div style="padding: 30px; background: white; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); position: sticky; top: 100px;">
                  <h3 style="margin-bottom: 20px; color: #1e293b;">Resumen del Pedido</h3>
                  
                  <div style="margin-bottom: 20px;">
                    <img 
                      src={course.featured_image} 
                      alt={course.title}
                      style="width: 100%; border-radius: 8px; margin-bottom: 15px;"
                    />
                    <h4 style="color: #1e293b; margin-bottom: 10px; font-size: 1.1rem;">{course.title}</h4>
                    <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 15px;">{course.subtitle}</p>
                    
                    <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 15px;">
                      <span style="display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; background: #f1f5f9; border-radius: 20px; font-size: 0.85rem; color: #64748b;">
                        <i className="fas fa-clock"></i> {course.duration_weeks} semanas
                      </span>
                      <span style="display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; background: #f1f5f9; border-radius: 20px; font-size: 0.85rem; color: #64748b;">
                        <i className="fas fa-signal"></i> {course.level}
                      </span>
                    </div>
                  </div>

                  <div style="border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 20px 0; margin: 20px 0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                      <span style="color: #64748b;">Precio del curso:</span>
                      <span style="font-weight: 600; color: #1e293b;">${course.price} {course.currency}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                      <span style="color: #64748b;">Descuento:</span>
                      <span style="font-weight: 600; color: #10b981;">$0.00</span>
                    </div>
                  </div>

                  <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                    <span style="font-size: 1.1rem; font-weight: 600; color: #1e293b;">Total:</span>
                    <span style="font-size: 1.3rem; font-weight: 700; color: #8b5cf6;">${course.price} {course.currency}</span>
                  </div>

                  <div style="padding: 15px; background: #f0fdf4; border-radius: 8px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 10px; color: #16a34a; font-size: 0.9rem;">
                      <i className="fas fa-check-circle"></i>
                      <span style="font-weight: 600;">Acceso inmediato al curso</span>
                    </div>
                  </div>

                  <div style="font-size: 0.85rem; color: #64748b;">
                    <p style="margin-bottom: 10px;">✓ Acceso de por vida</p>
                    <p style="margin-bottom: 10px;">✓ Certificado al completar</p>
                    <p style="margin-bottom: 10px;">✓ Recursos descargables</p>
                    <p style="margin-bottom: 0;">✓ Comunidad privada</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <script src="https://js.stripe.com/v3/"></script>
        <script dangerouslySetInnerHTML={{__html: `
          const stripe = Stripe('${c.env.STRIPE_PUBLISHABLE_KEY}');
          const elements = stripe.elements();
          const cardElement = elements.create('card', {
            style: {
              base: {
                fontSize: '16px',
                color: '#1e293b',
                '::placeholder': { color: '#94a3b8' }
              }
            }
          });
          cardElement.mount('#card-element');

          // Manejo de errores de tarjeta
          cardElement.on('change', (event) => {
            const displayError = document.getElementById('card-errors');
            if (event.error) {
              displayError.textContent = event.error.message;
            } else {
              displayError.textContent = '';
            }
          });

          // Selector de método de pago
          function selectPaymentMethod(method) {
            const stripBtn = document.getElementById('select-stripe');
            const paypalBtn = document.getElementById('select-paypal');
            const stripeDiv = document.getElementById('stripe-payment');
            const paypalDiv = document.getElementById('paypal-payment');

            if (method === 'stripe') {
              stripBtn.classList.add('active');
              stripBtn.style.borderColor = '#8b5cf6';
              paypalBtn.classList.remove('active');
              paypalBtn.style.borderColor = '#e2e8f0';
              stripeDiv.style.display = 'block';
              paypalDiv.style.display = 'none';
            } else {
              paypalBtn.classList.add('active');
              paypalBtn.style.borderColor = '#8b5cf6';
              stripBtn.classList.remove('active');
              stripBtn.style.borderColor = '#e2e8f0';
              paypalDiv.style.display = 'block';
              stripeDiv.style.display = 'none';
              loadPayPalButton();
            }
          }

          // Formulario de pago con Stripe
          const form = document.getElementById('payment-form');
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitButton = document.getElementById('submit-stripe');
            const messageDiv = document.getElementById('checkout-message');
            const originalText = submitButton.innerHTML;
            
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
            messageDiv.style.display = 'none';

            try {
              // Crear Payment Intent
              const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  courseId: ${courseId},
                  paymentMethod: 'stripe'
                })
              });

              const { clientSecret, error } = await response.json();

              if (error) {
                throw new Error(error);
              }

              // Confirmar pago
              const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                  card: cardElement,
                  billing_details: {
                    name: document.getElementById('card-holder-name').value
                  }
                }
              });

              if (stripeError) {
                throw new Error(stripeError.message);
              }

              // Verificar pago en el servidor
              const verifyResponse = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  paymentIntentId: paymentIntent.id,
                  courseId: ${courseId}
                })
              });

              const verifyData = await verifyResponse.json();

              if (verifyData.success) {
                window.location.href = '/pago-exitoso?courseId=${courseId}';
              } else {
                throw new Error('Error al verificar el pago');
              }

            } catch (error) {
              messageDiv.className = 'auth-message error';
              messageDiv.textContent = error.message;
              messageDiv.style.display = 'block';
              submitButton.disabled = false;
              submitButton.innerHTML = originalText;
            }
          });

          // PayPal
          function loadPayPalButton() {
            if (window.paypalLoaded) return;
            
            const script = document.createElement('script');
            script.src = 'https://www.paypal.com/sdk/js?client-id=${c.env.PAYPAL_CLIENT_ID}&currency=${course.currency}';
            script.onload = () => {
              window.paypalLoaded = true;
              paypal.Buttons({
                createOrder: async () => {
                  const response = await fetch('/api/create-paypal-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ courseId: ${courseId} })
                  });
                  const data = await response.json();
                  return data.orderId;
                },
                onApprove: async (data) => {
                  const response = await fetch('/api/capture-paypal-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      orderId: data.orderID,
                      courseId: ${courseId}
                    })
                  });
                  const result = await response.json();
                  if (result.success) {
                    window.location.href = '/pago-exitoso?courseId=${courseId}';
                  }
                },
                onError: (err) => {
                  const messageDiv = document.getElementById('checkout-message');
                  messageDiv.className = 'auth-message error';
                  messageDiv.textContent = 'Error al procesar el pago con PayPal';
                  messageDiv.style.display = 'block';
                }
              }).render('#paypal-button-container');
            };
            document.head.appendChild(script);
          }
        `}} />
      </div>
    )
  } catch (error) {
    console.error('Error en checkout:', error)
    return c.redirect('/cursos')
  }
})

// Página: Pago Exitoso
app.get('/pago-exitoso', async (c) => {
  const courseId = c.req.query('courseId')
  
  return c.render(
    <div>
      <section className="section" style="padding: 100px 20px; text-align: center;">
        <div className="container" style="max-width: 600px; margin: 0 auto;">
          <div style="width: 100px; height: 100px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; margin: 0 auto 30px; display: flex; align-items: center; justify-content: center;">
            <i className="fas fa-check fa-3x" style="color: white;"></i>
          </div>
          
          <h1 style="color: #1e293b; margin-bottom: 20px;">¡Pago Exitoso!</h1>
          <p style="font-size: 1.2rem; color: #64748b; margin-bottom: 30px;">
            Tu inscripción ha sido procesada correctamente
          </p>
          
          <div style="padding: 30px; background: #f8fafc; border-radius: 12px; margin-bottom: 30px; text-align: left;">
            <h3 style="color: #1e293b; margin-bottom: 15px;">¿Qué sigue?</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                <i className="fas fa-check-circle" style="color: #10b981; margin-right: 10px;"></i>
                Recibirás un correo de confirmación
              </li>
              <li style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                <i className="fas fa-check-circle" style="color: #10b981; margin-right: 10px;"></i>
                Acceso inmediato a todas las lecciones
              </li>
              <li style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                <i className="fas fa-check-circle" style="color: #10b981; margin-right: 10px;"></i>
                Descarga los recursos del curso
              </li>
              <li style="padding: 10px 0;">
                <i className="fas fa-check-circle" style="color: #10b981; margin-right: 10px;"></i>
                Únete a la comunidad privada
              </li>
            </ul>
          </div>

          <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
            <a href="/mi-aprendizaje" className="btn btn-primary btn-lg">
              <i className="fas fa-graduation-cap"></i> Ir a Mis Cursos
            </a>
            {courseId && (
              <a href={`/curso/${courseId}`} className="btn btn-secondary btn-lg">
                <i className="fas fa-play"></i> Comenzar Curso
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  )
})

// ===== RUTAS DE CURSOS =====

// Página: Listado de Cursos
app.get('/cursos', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT id, slug, title, subtitle, description, duration_weeks, level, price, currency, featured_image, featured, enrollment_count, rating
      FROM courses 
      WHERE published = 1
      ORDER BY featured DESC, created_at DESC
    `).all()

    const courses = result.results || []

    return c.render(
      <div>
        {/* Hero */}
        <section className="hero hero-small">
          <div className="container">
            <h1>Cursos y Programas</h1>
            <p className="lead">
              Programas estructurados para desarrollar habilidades emocionales y relacionales que cambiarán tu vida
            </p>
          </div>
        </section>

        {/* Filtros */}
        <section className="section">
          <div className="container">
            <div className="course-filters" style="display: flex; gap: 15px; justify-content: center; margin-bottom: 40px;">
              <button className="btn btn-sm btn-primary">Todos</button>
              <button className="btn btn-sm btn-secondary">Principiante</button>
              <button className="btn btn-sm btn-secondary">Intermedio</button>
              <button className="btn btn-sm btn-secondary">Destacados</button>
            </div>
          </div>
        </section>

        {/* Cursos Grid */}
        <section className="section" style="padding-top: 0;">
          <div className="container">
            <div className="courses-grid">
              {courses.map((course) => (
                <div className="course-card" key={course.id}>
                  <div className="course-image">
                    <img src={course.featured_image} alt={course.title} />
                    {course.featured && (
                      <span className="course-badge">⭐ Destacado</span>
                    )}
                  </div>
                  <div className="course-body">
                    <div className="course-meta">
                      <span className="course-level">{course.level}</span>
                      <span className="course-duration">
                        <i className="fas fa-clock"></i> {course.duration_weeks} semanas
                      </span>
                    </div>
                    <h3>{course.title}</h3>
                    <p>{course.subtitle}</p>
                    <div className="course-footer">
                      <div className="course-price">
                        <span className="price-amount">${course.price}</span>
                        <span className="price-currency">{course.currency}</span>
                      </div>
                      <a href={`/cursos/${course.slug}`} className="btn btn-primary btn-sm">
                        Ver curso <i className="fas fa-arrow-right"></i>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section cta-section">
          <div className="container">
            <h2 className="text-light">¿Tienes preguntas sobre los cursos?</h2>
            <p className="text-light lead">
              Estamos aquí para ayudarte a elegir el programa adecuado para ti
            </p>
            <div className="cta-buttons">
              <a href="/contacto" className="btn btn-light btn-lg">
                <i className="fas fa-envelope"></i> Contáctanos
              </a>
              <a href="/recursos-gratuitos" className="btn btn-outline-light btn-lg">
                <i className="fas fa-gift"></i> Prueba gratis primero
              </a>
            </div>
          </div>
        </section>
      </div>
    )
  } catch (error) {
    console.error('Error al cargar cursos:', error)
    return c.render(
      <div>
        <section className="section">
          <div className="container text-center">
            <h1>Error al cargar cursos</h1>
            <p>Por favor, intenta de nuevo más tarde.</p>
            <a href="/" className="btn btn-primary">Volver al inicio</a>
          </div>
        </section>
      </div>
    )
  }
})

// Página: Detalle de Curso Individual
app.get('/cursos/:slug', async (c) => {
  try {
    const slug = c.req.param('slug')
    
    const result = await c.env.DB.prepare(`
      SELECT * FROM courses WHERE slug = ? AND published = 1
    `).bind(slug).first()

    if (!result) {
      return c.render(
        <div>
          <section className="section">
            <div className="container text-center">
              <h1>Curso no encontrado</h1>
              <p>El curso que buscas no existe o no está disponible.</p>
              <a href="/cursos" className="btn btn-primary">Ver todos los cursos</a>
            </div>
          </section>
        </div>
      )
    }

    const course = result
    
    // Verificar si el usuario está autenticado e inscrito
    let isEnrolled = false
    let firstLessonId = null
    
    try {
      const { getCurrentUser, userHasAccess } = await import('./auth-utils')
      const user = await getCurrentUser(c)
      
      if (user) {
        isEnrolled = await userHasAccess(c.env.DB, user.id, course.id)
        
        if (isEnrolled) {
          // Obtener primera lección
          const firstLesson = await c.env.DB.prepare(`
            SELECT id FROM lessons 
            WHERE course_id = ? AND published = 1 
            ORDER BY order_index ASC 
            LIMIT 1
          `).bind(course.id).first()
          
          firstLessonId = firstLesson?.id
        }
      }
    } catch (error) {
      // Usuario no autenticado, continuar mostrando el curso
      console.log('Usuario no autenticado')
    }
    
    const whatYouLearn = JSON.parse(course.what_you_learn || '[]')
    const courseContent = JSON.parse(course.course_content || '[]')
    const requirements = JSON.parse(course.requirements || '[]')
    const targetAudience = JSON.parse(course.target_audience || '[]')

    return c.render(
      <div>
        {/* Hero del Curso */}
        <section className="hero" style="background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);">
          <div className="container">
            <div className="course-hero-content">
              <div className="course-hero-text">
                <span className="course-level-badge">{course.level}</span>
                <h1 className="hero-title" style="font-size: 2.5rem;">{course.title}</h1>
                <p className="hero-subtitle" style="font-size: 1.3rem;">{course.subtitle}</p>
                <div className="course-hero-meta">
                  <span><i className="fas fa-clock"></i> {course.duration_weeks} semanas</span>
                  <span><i className="fas fa-users"></i> {course.enrollment_count || 0} estudiantes</span>
                  <span><i className="fas fa-star"></i> {course.rating || '5.0'}/5.0</span>
                </div>
                <div className="hero-buttons">
                  {isEnrolled ? (
                    firstLessonId ? (
                      <a href={`/cursos/${course.slug}/leccion/${firstLessonId}`} className="btn btn-light btn-lg">
                        <i className="fas fa-play"></i> Comenzar Curso
                      </a>
                    ) : (
                      <a href="/mi-aprendizaje" className="btn btn-light btn-lg">
                        <i className="fas fa-graduation-cap"></i> Ir a Mis Cursos
                      </a>
                    )
                  ) : (
                    <a href={`/checkout/${course.id}`} className="btn btn-light btn-lg">
                      <i className="fas fa-shopping-cart"></i> Comprar ahora - ${course.price} {course.currency}
                    </a>
                  )}
                  <a href="#contenido" className="btn btn-outline-light btn-lg">
                    <i className="fas fa-list"></i> Ver contenido
                  </a>
                </div>
              </div>
              <div className="course-hero-image">
                <img src={course.featured_image} alt={course.title} style="border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);" />
              </div>
            </div>
          </div>
        </section>

        {/* Descripción */}
        <section className="section">
          <div className="container">
            <div className="course-detail-grid">
              <div className="course-main-content">
                <h2>Sobre este curso</h2>
                <p className="lead">{course.description}</p>

                {/* Lo que aprenderás */}
                <h3 style="margin-top: 40px;">¿Qué aprenderás?</h3>
                <ul className="check-list">
                  {whatYouLearn.map((item, idx) => (
                    <li key={idx}>
                      <i className="fas fa-check"></i> {item}
                    </li>
                  ))}
                </ul>

                {/* Contenido del curso */}
                <h3 id="contenido" style="margin-top: 50px;">Contenido del curso</h3>
                <div className="course-modules">
                  {courseContent.map((module, idx) => (
                    <div className="module-item" key={idx}>
                      <h4>
                        <i className="fas fa-folder"></i> Módulo {module.module}: {module.title}
                      </h4>
                      <ul>
                        {module.lessons && module.lessons.map((lesson, lessonIdx) => (
                          <li key={lessonIdx}>
                            <i className="fas fa-play-circle"></i> {lesson}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Requisitos */}
                <h3 style="margin-top: 50px;">Requisitos</h3>
                <ul>
                  {requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>

                {/* Para quién es */}
                <h3 style="margin-top: 40px;">¿Para quién es este curso?</h3>
                <ul>
                  {targetAudience.map((audience, idx) => (
                    <li key={idx}>{audience}</li>
                  ))}
                </ul>
              </div>

              {/* Sidebar */}
              <div className="course-sidebar">
                <div className="course-cta-box">
                  <div className="course-price-box">
                    <span className="price-label">Precio del curso</span>
                    <div className="price-value">
                      <span className="currency">$</span>
                      <span className="amount">{course.price}</span>
                      <span className="currency-code">{course.currency}</span>
                    </div>
                  </div>
                  
                  <a href="#inscripcion" className="btn btn-primary btn-block btn-lg">
                    <i className="fas fa-shopping-cart"></i> Inscribirme ahora
                  </a>

                  <div className="course-includes">
                    <h4>Este curso incluye:</h4>
                    <ul>
                      <li><i className="fas fa-video"></i> {course.duration_weeks * 3} horas de video</li>
                      <li><i className="fas fa-file-pdf"></i> Material descargable</li>
                      <li><i className="fas fa-infinity"></i> Acceso de por vida</li>
                      <li><i className="fas fa-mobile-alt"></i> Acceso móvil y PC</li>
                      <li><i className="fas fa-certificate"></i> Certificado al finalizar</li>
                      <li><i className="fas fa-comments"></i> Soporte del instructor</li>
                    </ul>
                  </div>

                  <div className="instructor-box">
                    <h4>Tu instructor</h4>
                    <div className="instructor-info">
                      <i className="fas fa-user-circle fa-3x"></i>
                      <div>
                        <strong>{course.instructor_name}</strong>
                        <p style="font-size: 0.9rem; margin-top: 5px;">{course.instructor_bio}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Inscripción */}
        <section id="inscripcion" className="section bg-light">
          <div className="container">
            <div className="enrollment-section">
              <h2 className="text-center">Inscríbete ahora</h2>
              <p className="text-center lead" style="max-width: 600px; margin: 0 auto 30px;">
                Comienza tu transformación hoy. Completa tus datos y te enviaremos la información de pago.
              </p>
              <form className="enrollment-form" style="max-width: 500px; margin: 0 auto;">
                <div className="form-group">
                  <label>Nombre completo *</label>
                  <input type="text" name="name" required placeholder="Tu nombre" />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" name="email" required placeholder="tu@email.com" />
                </div>
                <div className="form-group">
                  <label>Teléfono (opcional)</label>
                  <input type="tel" name="phone" placeholder="+1234567890" />
                </div>
                <div className="form-group">
                  <label>¿Por qué te interesa este curso?</label>
                  <textarea name="motivation" rows="4" placeholder="Cuéntanos brevemente..."></textarea>
                </div>
                <button type="submit" className="btn btn-primary btn-block btn-lg">
                  <i className="fas fa-paper-plane"></i> Solicitar información de inscripción
                </button>
                <p className="text-center" style="margin-top: 15px; font-size: 0.9rem; color: #64748b;">
                  Te contactaremos en menos de 24 horas con los detalles de pago
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* Otros cursos */}
        <section className="section">
          <div className="container">
            <h2 className="section-title">Otros cursos que podrían interesarte</h2>
            <p className="text-center" style="margin-bottom: 40px;">
              <a href="/cursos" className="btn btn-secondary">Ver todos los cursos</a>
            </p>
          </div>
        </section>
      </div>
    )
  } catch (error) {
    console.error('Error al cargar curso:', error)
    return c.render(
      <div>
        <section className="section">
          <div className="container text-center">
            <h1>Error al cargar el curso</h1>
            <p>Por favor, intenta de nuevo más tarde.</p>
            <a href="/cursos" className="btn btn-primary">Ver todos los cursos</a>
          </div>
        </section>
      </div>
    )
  }
})

export default app
