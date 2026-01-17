import { Hono } from 'hono'
import { AdminLayout } from './layout'

export const dashboard = new Hono<{ Bindings: any }>()

dashboard.get('/', async (c) => {
  const user = c.get('user')

  // Stats counters
  const postCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM blog_posts').first()
  const courseCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM courses').first()
  const userCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users WHERE role = "student"').first()
  const recentEnrolls = await c.env.DB.prepare(`
    SELECT pe.*, u.name as user_name, c.title as course_title
    FROM paid_enrollments pe
    JOIN users u ON pe.user_id = u.id
    JOIN courses c ON pe.course_id = c.id
    ORDER BY pe.enrolled_at DESC LIMIT 5
  `).all()

  return c.html(
    (<AdminLayout title="Dashboard" user={user}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
          <div className="text-purple-500 text-sm font-semibold uppercase mb-2">Total Blog Posts</div>
          <div className="text-3xl font-bold text-gray-800">{postCount.count}</div>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
          <div className="text-green-500 text-sm font-semibold uppercase mb-2">Cursos Activos</div>
          <div className="text-3xl font-bold text-gray-800">{courseCount.count}</div>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <div className="text-blue-500 text-sm font-semibold uppercase mb-2">Estudiantes</div>
          <div className="text-3xl font-bold text-gray-800">{userCount.count}</div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-800 mb-4">Inscripciones Recientes</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase">
              <th className="p-3">Estudiante</th>
              <th className="p-3">Curso</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recentEnrolls.results?.length ? recentEnrolls.results.map((enroll: any) => (
              <tr>
                <td className="p-3 font-medium">{enroll.user_name}</td>
                <td className="p-3 text-gray-600">{enroll.course_title}</td>
                <td className="p-3 text-gray-500 text-sm">{new Date(enroll.enrolled_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    enroll.payment_status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {enroll.payment_status}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">No hay inscripciones recientes</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>).toString()
  )
})
