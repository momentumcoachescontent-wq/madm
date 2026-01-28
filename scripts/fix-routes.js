import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routesPath = path.resolve(__dirname, '../dist/_routes.json');

console.log(`Checking _routes.json at ${routesPath}...`);

if (fs.existsSync(routesPath)) {
  try {
    const content = fs.readFileSync(routesPath, 'utf-8');
    const routes = JSON.parse(content);

    // Ensure exclude list exists
    if (!routes.exclude) {
      routes.exclude = [];
    }

    // Add /assets/* if not present
    if (!routes.exclude.includes('/assets/*')) {
      routes.exclude.push('/assets/*');
      fs.writeFileSync(routesPath, JSON.stringify(routes));
      console.log('Successfully added /assets/* to _routes.json exclude list');
    } else {
      console.log('/assets/* is already in the exclude list');
    }
  } catch (error) {
    console.error('Error processing _routes.json:', error);
    process.exit(1);
  }
} else {
  console.warn('_routes.json not found in dist/. This is expected if the build failed or provided no routes.');
}
