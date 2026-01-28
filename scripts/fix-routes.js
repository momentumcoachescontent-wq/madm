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

  // Ensure include exists (defensive)
  if (!Array.isArray(routes.include) || routes.include.length === 0) {
    routes.include = ['/*']
  }

  // Ensure exclude list exists
  if (!Array.isArray(routes.exclude)) {
    routes.exclude = []
  }

  // Ensure static assets are excluded from Worker routing
  const requiredExcludes = ['/assets/*', '/static/*']
  for (const rule of requiredExcludes) {
    if (!routes.exclude.includes(rule)) routes.exclude.push(rule)
  }

  // CRITICAL: remove accidental admin exclusions
  const blockedAdmin = new Set(['/admin', '/admin/', '/admin/*'])
  routes.exclude = routes.exclude.filter((p) => !blockedAdmin.has(p))

  fs.writeFileSync(routesPath, JSON.stringify(routes, null, 2))
  console.log('Updated _routes.json successfully.')
  console.log('include:', routes.include)
  console.log('exclude:', routes.exclude)
} catch (error) {
  console.error('Error processing _routes.json:', error)
  process.exit(1)
}
