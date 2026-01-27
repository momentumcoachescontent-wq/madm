import { Hono } from 'hono'
import { CloudflareBindings } from '../types'

export function registerStudentRoutes(app: Hono<{ Bindings: CloudflareBindings }>) {
  const studentRoutes = new Hono<{ Bindings: CloudflareBindings }>()

  // ===== PÁGINA: MI APRENDIZAJE (Dashboard del Estudiante) =====

  studentRoutes.get('/mi-aprendizaje', async (c) => {
    try {
      // Verificar autenticación
      const { getCurrentUser, getCourseProgress } = await import('../auth-utils')
      const { getStudentEnrollmentsWithCourse, getLastAccessedLesson, getCertificate } = await import('../models/enrollments')
      const { getFirstLesson } = await import('../models/lessons')
      const user = await getCurrentUser(c)

      if (!user) {
        return c.redirect('/login')
      }

      // Obtener cursos inscritos con progreso
      const enrollments = await getStudentEnrollmentsWithCourse(c.env.DB, user.id)

      // Calcular progreso de cada curso
      const coursesWithProgress = await Promise.all(
        enrollments.map(async (enrollment: any) => {
          const progress = await getCourseProgress(c.env.DB, user.id, enrollment.course_id)

          // Obtener primera lección del curso
          const firstLesson = await getFirstLesson(c.env.DB, enrollment.course_id)

          // Obtener última lección en progreso (si existe)
          const lastLesson = await getLastAccessedLesson(c.env.DB, user.id, enrollment.course_id)

          // Obtener certificado si existe
          const certificate = await getCertificate(c.env.DB, user.id, enrollment.course_id)

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
                  <button id="logoutBtn" className="btn btn-secondary" style="margin-left: 10px;">
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
  studentRoutes.get('/cursos/:courseSlug/leccion/:lessonId', async (c) => {
    try {
      const { getCurrentUser, userHasAccess } = await import('../auth-utils')
      const user = await getCurrentUser(c)

      if (!user) {
        return c.redirect('/login')
      }

      const { getCourseBySlug } = await import('../models/courses')
      const { getLessonById, getLessonsByCourseId, getLessonResources } = await import('../models/lessons')

      const courseSlug = c.req.param('courseSlug')
      const lessonId = parseInt(c.req.param('lessonId'))

      // Obtener información del curso
      const course = await getCourseBySlug(c.env.DB, courseSlug)

      if (!course || !course.published) {
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
      const lesson = await getLessonById(c.env.DB, lessonId)

      if (!lesson || lesson.course_id !== course.id || !lesson.published) {
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

      const { getLessonProgress, getCompletedLessons } = await import('../models/enrollments')

      // Obtener progreso del estudiante
      const progress = await getLessonProgress(c.env.DB, user.id, lessonId)

      // Obtener todas las lecciones del curso para navegación
      const allLessons = await getLessonsByCourseId(c.env.DB, course.id)

      // Obtener lecciones completadas
      const completedLessonIds = await getCompletedLessons(c.env.DB, user.id, course.id)
      const completedIds = new Set(completedLessonIds)

      // Agrupar lecciones por módulo
      const moduleMap = new Map()
      for (const l of (allLessons || [])) {
        if (!moduleMap.has(l.module_number)) {
          moduleMap.set(l.module_number, [])
        }
        moduleMap.get(l.module_number).push(l)
      }

      // Encontrar lección anterior y siguiente
      const currentIndex = (allLessons || []).findIndex((l: any) => l.id === lessonId)
      const prevLesson = currentIndex > 0 ? (allLessons || [])[currentIndex - 1] : null
      const nextLesson = currentIndex < (allLessons || []).length - 1 ? (allLessons || [])[currentIndex + 1] : null

      // Obtener recursos de la lección
      const resources = await getLessonResources(c.env.DB, lessonId)

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
                  {resources && resources.length > 0 && (
                    <div style="margin-bottom: 40px;">
                      <h2 style="font-size: 1.5rem; color: #1e293b; margin-bottom: 20px;">
                        <i className="fas fa-download"></i> Recursos Descargables
                      </h2>
                      {resources.map((resource: any) => (
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
                    <button id="saveNotesBtn" className="btn btn-primary" style="margin-top: 15px;">
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
                      <span style="font-weight: 700; color: #1e293b;">{completedIds.size} / {allLessons?.length || 0}</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                      <div style={`width: ${((completedIds.size / (allLessons?.length || 1)) * 100).toFixed(0)}%; height: 100%; background: linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%); transition: width 0.3s;`}></div>
                    </div>
                    <p style="text-align: center; margin-top: 10px; font-size: 24px; font-weight: 700; color: #8b5cf6;">
                      {((completedIds.size / (allLessons?.length || 1)) * 100).toFixed(0)}%
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
            document.addEventListener('DOMContentLoaded', () => {
              if (window.ADM && window.ADM.video) {
                window.ADM.video.initVideoTracking(
                  ${lessonId},
                  ${course.id},
                  ${progress?.last_position || 0},
                  ${lesson.video_duration || 0}
                );
                window.ADM.video.initCompletion(
                  ${lessonId},
                  ${course.id},
                  ${progress?.completed ? 'true' : 'false'}
                );
                window.ADM.video.initNotes(
                  ${lessonId},
                  ${course.id}
                );
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

  // ===== SISTEMA DE CERTIFICADOS =====

  // Página: Ver Certificado
  studentRoutes.get('/certificado/:certificateId', async (c) => {
    try {
      const { getCurrentUser } = await import('../auth-utils')
      const { getCertificateDetails } = await import('../models/enrollments')
      const user = await getCurrentUser(c)

      if (!user) {
        return c.redirect('/login')
      }

      const certificateId = parseInt(c.req.param('certificateId'))

      // Obtener certificado con información del usuario y curso
      const certificate = await getCertificateDetails(c.env.DB, certificateId, user.id)

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
            <button id="downloadPdfBtn" className="btn btn-secondary btn-lg" style="margin-left: 15px;">
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

  // ===== SISTEMA DE QUIZZES =====

  // Página: Tomar Quiz
  studentRoutes.get('/cursos/:courseSlug/quiz/:quizId', async (c) => {
    try {
      const { getCurrentUser, userHasAccess } = await import('../auth-utils')
      const { getQuiz, getQuizAttempts, getQuizQuestions, getQuizOptions } = await import('../models/quizzes')
      const user = await getCurrentUser(c)

      if (!user) {
        return c.redirect('/login')
      }

      const { getCourseBySlug } = await import('../models/courses')
      const courseSlug = c.req.param('courseSlug')
      const quizId = parseInt(c.req.param('quizId'))

      // Obtener información del curso
      const course = await getCourseBySlug(c.env.DB, courseSlug)

      if (!course || !course.published) {
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
      const quiz = await getQuiz(c.env.DB, quizId)

      if (!quiz || quiz.course_id !== course.id || !quiz.published) {
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
      const attempts = await getQuizAttempts(c.env.DB, user.id, quizId)

      const attemptCount = attempts.length
      const lastAttempt = attempts[0]
      const canRetake = !quiz.max_attempts || attemptCount < quiz.max_attempts

      // Si ya completó y pasó, mostrar resultados
      if (lastAttempt && lastAttempt.passed && !canRetake) {
        return c.redirect(`/cursos/${courseSlug}/quiz/${quizId}/resultado/${lastAttempt.id}`)
      }

      // Obtener preguntas con opciones
      const questions = await getQuizQuestions(c.env.DB, quizId, !!quiz.randomize_questions)

      const questionsWithOptions = await Promise.all(
        questions.map(async (q: any) => {
          const options = await getQuizOptions(c.env.DB, q.id, !!quiz.randomize_options, false)

          return {
            ...q,
            options
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
            document.addEventListener('DOMContentLoaded', () => {
              if (window.ADM && window.ADM.quiz) {
                window.ADM.quiz.initQuiz(
                  ${quizId},
                  ${course.id},
                  ${quiz.time_limit || 0},
                  ${JSON.stringify(courseSlug)}
                );
              }
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

  // Página: Resultado del Quiz
  studentRoutes.get('/cursos/:courseSlug/quiz/:quizId/resultado/:attemptId', async (c) => {
    try {
      const { getCurrentUser } = await import('../auth-utils')
      const { getQuiz, getQuizAttempt, getQuizAnswersDetailed, getQuizOptions } = await import('../models/quizzes')
      const user = await getCurrentUser(c)

      if (!user) {
        return c.redirect('/login')
      }

      const { getCourseBySlug } = await import('../models/courses')
      const courseSlug = c.req.param('courseSlug')
      const quizId = parseInt(c.req.param('quizId'))
      const attemptId = parseInt(c.req.param('attemptId'))

      // Obtener curso
      const course = await getCourseBySlug(c.env.DB, courseSlug)

      if (!course) {
        return c.render(<div><section className="section"><div className="container text-center"><h1>Curso no encontrado</h1></div></section></div>)
      }

      // Obtener intento
      const attempt = await getQuizAttempt(c.env.DB, attemptId, user.id)

      if (!attempt || attempt.quiz_id !== quizId) {
        return c.render(<div><section className="section"><div className="container text-center"><h1>Resultado no encontrado</h1></div></section></div>)
      }

      // Obtener quiz
      const quiz = await getQuiz(c.env.DB, quizId)

      // Obtener respuestas detalladas
      const answers = await getQuizAnswersDetailed(c.env.DB, attemptId)

      // Obtener opciones para cada pregunta
      const detailedAnswers = await Promise.all(
        answers.map(async (answer: any) => {
          const options = await getQuizOptions(c.env.DB, answer.question_id, false, true)

          const selectedIds = JSON.parse(answer.selected_options)

          return {
            ...answer,
            options,
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

  // ===== RUTAS DE PAGOS Y CHECKOUT =====

  // Página: Checkout
  studentRoutes.get('/checkout/:courseId', async (c) => {
    try {
      const courseId = parseInt(c.req.param('courseId'))

      // Verificar autenticación
      const { getCurrentUser } = await import('../auth-utils')
      const user = await getCurrentUser(c)

      if (!user) {
        return c.redirect(`/login?redirect=/checkout/${courseId}`)
      }

      // Obtener información del curso
      const { getCourseById } = await import('../models/courses')
      const course = await getCourseById(c.env.DB, courseId)

      if (!course || !course.published) {
        return c.redirect('/cursos')
      }

      const { userHasAccess } = await import('../auth-utils')

      // Verificar si ya está inscrito
      const hasAccess = await userHasAccess(c.env.DB, user.id, courseId)

      if (hasAccess) {
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
            document.addEventListener('DOMContentLoaded', () => {
              if (window.ADM && window.ADM.stripe) {
                window.ADM.stripe.initCheckout({
                  stripeKey: '${c.env.STRIPE_PUBLISHABLE_KEY}',
                  paypalClientId: '${c.env.PAYPAL_CLIENT_ID}',
                  courseId: ${courseId},
                  currency: '${course.currency}',
                  price: ${course.price}
                });
              }
            });
          `}} />
        </div>
      )
    } catch (error) {
      console.error('Error en checkout:', error)
      return c.redirect('/cursos')
    }
  })

  // Página: Pago Exitoso
  studentRoutes.get('/pago-exitoso', async (c) => {
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

  app.route('/', studentRoutes)
}
