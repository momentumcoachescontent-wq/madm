import { Hono } from 'hono'
import { CloudflareBindings } from '../types'

export function registerPublicRoutes(app: Hono<{ Bindings: CloudflareBindings }>) {
  const publicRoutes = new Hono<{ Bindings: CloudflareBindings }>()

  // Media Proxy for R2
  publicRoutes.get('/media/:key', async (c) => {
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

  // Página de Inicio
  publicRoutes.get('/', (c) => {
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
  publicRoutes.get('/el-libro', (c) => {
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
  publicRoutes.get('/metodo', (c) => {
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
  publicRoutes.get('/recursos-gratuitos', (c) => {
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
                  <i className="fas fa-robot fa-4x"></i>
                </div>
                <div className="resource-content">
                  <h3>Asistente Virtual IA</h3>
                  <p className="resource-type">
                    <span className="badge">Herramienta Interactiva</span>
                    <span className="badge">Acceso Inmediato</span>
                  </p>
                  <p>
                    Un chatbot inteligente diseñado para analizar tu situación actual y ofrecerte recomendaciones personalizadas basadas en el método "Más Allá del Miedo".
                  </p>
                  <a href="https://opal.google/?flow=drive:/1ksajqIwfHXZb3FLtvzuC8ddkx4uZgE9_&shared&mode=app" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    <i className="fas fa-comments"></i> Iniciar Análisis
                  </a>
                </div>
              </div>

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

            {/* New AI Tool Banner */}
            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); border-radius: 12px; padding: 30px; margin-bottom: 50px; color: white; display: flex; align-items: center; gap: 30px; box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3); flex-wrap: wrap;">
              <div style="flex: 0 0 80px; text-align: center;">
                 <i className="fas fa-robot fa-4x"></i>
              </div>
              <div style="flex: 1; min-width: 250px;">
                 <h3 style="font-size: 1.5rem; margin-bottom: 10px; color: white;">Nuevo: Analiza tu caso con IA</h3>
                 <p style="opacity: 0.9;">Cuéntale tu situación a nuestro asistente inteligente y recibe un análisis inmediato y recomendaciones personalizadas.</p>
              </div>
              <div>
                 <a href="https://opal.google/?flow=drive:/1ksajqIwfHXZb3FLtvzuC8ddkx4uZgE9_&shared&mode=app" target="_blank" rel="noopener noreferrer" className="btn btn-light">
                   <i className="fas fa-arrow-right"></i> Probar Ahora
                 </a>
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
  publicRoutes.get('/contacto', (c) => {
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
                    <textarea id="message" name="message" rows={6} required></textarea>
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
  publicRoutes.get('/comunidad', (c) => {
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
                  <i className="fab fa-discord"></i> Únete a Nuestra Comunidad
                </h2>
                <p style="font-size: 1.1rem; margin-bottom: 30px; opacity: 0.95;">
                  Únete a nuestra comunidad. Contamos con una sección abierta para todos y áreas privadas exclusivas para estudiantes.
                </p>
                <a href="https://discord.gg/7YZKew5Phx" target="_blank" rel="noopener noreferrer" className="btn btn-light btn-lg" style="background: white; color: #8b5cf6;">
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
  publicRoutes.get('/sobre-nosotros', (c) => {
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
  publicRoutes.get('/login', (c) => {
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
  publicRoutes.get('/registro', (c) => {
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
                    <input type="password" id="password" name="password" required placeholder="••••••••" minLength={6} />
                  </div>

                  <div className="form-group">
                    <label for="password_confirm">Confirmar contraseña *</label>
                    <input type="password" id="password_confirm" name="password_confirm" required placeholder="••••••••" minLength={6} />
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

  // Página: Verificar Certificado (pública)
  publicRoutes.get('/verificar/:code', async (c) => {
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
      `).bind(code).first<any>()

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

  // Página: Listado de Blog
  publicRoutes.get('/blog', async (c) => {
    try {
      const { listBlogPosts, countBlogPosts } = await import('../models/blog')

      // Obtener parámetros de paginación
      const page = parseInt(c.req.query('page') || '1')
      const limit = 12
      const offset = (page - 1) * limit

      // Obtener posts
      const posts = await listBlogPosts(c.env.DB, {
        publishedOnly: true,
        limit,
        offset,
        orderBy: 'scheduled_at'
      })

      // Contar total de posts
      const total = await countBlogPosts(c.env.DB, { publishedOnly: true })

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
  publicRoutes.get('/blog/:slug', async (c) => {
    try {
      const { getBlogPostBySlug, incrementBlogPostViews, listBlogPosts } = await import('../models/blog')
      const slug = c.req.param('slug')

      // Obtener el post
      const post = await getBlogPostBySlug(c.env.DB, slug, { publishedOnly: true })

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
      await incrementBlogPostViews(c.env.DB, post.id)

      // Obtener posts relacionados
      const relatedPosts = await listBlogPosts(c.env.DB, {
        publishedOnly: true,
        excludeId: post.id,
        limit: 3,
        orderBy: 'random'
      })

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

          {relatedPosts && relatedPosts.length > 0 && (
            <section className="section bg-light">
              <div className="container">
                <h2 className="section-title">También te puede interesar</h2>
                <div className="blog-grid">
                  {relatedPosts.map((related: any) => (
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

  // Página: Listado de Cursos
  publicRoutes.get('/cursos', async (c) => {
    try {
      const result = await c.env.DB.prepare(`
        SELECT id, slug, title, subtitle, description, duration_weeks, level, price, currency, featured_image, featured, enrollment_count, rating
        FROM courses
        WHERE published = 1
        ORDER BY featured DESC, created_at DESC
      `).all<any>()

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
  publicRoutes.get('/cursos/:slug', async (c) => {
    try {
      const slug = c.req.param('slug')

      const result = await c.env.DB.prepare(`
        SELECT * FROM courses WHERE slug = ? AND published = 1
      `).bind(slug).first<any>()

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
        const { getCurrentUser, userHasAccess } = await import('../auth-utils')
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
            `).bind(course.id).first<any>()

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
                  {whatYouLearn.map((item: string, idx: number) => (
                      <li key={idx}>
                        <i className="fas fa-check"></i> {item}
                      </li>
                    ))}
                  </ul>

                  {/* Contenido del curso */}
                  <h3 id="contenido" style="margin-top: 50px;">Contenido del curso</h3>
                  <div className="course-modules">
                  {courseContent.map((module: any, idx: number) => (
                      <div className="module-item" key={idx}>
                        <h4>
                          <i className="fas fa-folder"></i> Módulo {module.module}: {module.title}
                        </h4>
                        <ul>
                          {module.lessons && module.lessons.map((lesson: any, lessonIdx: number) => (
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
                  {requirements.map((req: string, idx: number) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>

                  {/* Para quién es */}
                  <h3 style="margin-top: 40px;">¿Para quién es este curso?</h3>
                  <ul>
                  {targetAudience.map((audience: string, idx: number) => (
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
                    <textarea name="motivation" rows={4} placeholder="Cuéntanos brevemente..."></textarea>
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

  app.route('/', publicRoutes)
}
