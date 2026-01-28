import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const routesPath = path.resolve(__dirname, '../dist/_routes.json')

console.log(`Checking _routes.json at ${routesPath}...`)

if (!fs.existsSync(routesPath)) {
  console.warn('_routes.json not found in dist/. This is expected if the build failed or provided no routes.')
  process.exit(0)
}

try {
  const content = fs.readFileSync(routesPath, 'utf-8')
  const routes = JSON.parse(content)

  // Ensure include/exclude exist
  if (!Array.isArray(routes.include)) routes.include = ['/*']
  if (!Array.isArray(routes.exclude)) routes.exclude = []

  // Always route app pages through Worker
  if (!routes.include.includes('/*')) routes.include = ['/*']

  // Ensure static assets are excluded (served as static)
  const mustExclude = ['/assets/*', '/static/*', '/favicon.ico']
  for (const p of mustExclude) {
    if (!routes.exclude.includes(p)) routes.exclude.push(p)
  }

  // IMPORTANT: Never exclude admin or api routes (they must reach the Worker)
  routes.exclude = routes.exclude.filter((p) => {
    const s = String(p)
    return !s.startsWith('/admin') && !s.startsWith('/api')
  })

  fs.writeFileSync(routesPath, JSON.stringify(routes, null, 2))
  console.log('Updated _routes.json successfully.')
  console.log('Final include:', routes.include)
  console.log('Final exclude:', routes.exclude)
} catch (error) {
  console.error('Error processing _routes.json:', error)
  process.exit(1)
}
