# Sentinel's Journal

## 2026-01-21 - Missing Security Headers & Static Build Misconfiguration
**Vulnerability:** The application was missing standard security headers (HSTS, CSP, X-Frame-Options) and was configured to build as a static SPA, effectively disabling all backend security logic and API endpoints.
**Learning:** Security middleware is useless if the application build process doesn't include the server-side code. Validating the *build output* is as important as validating the code.
**Prevention:** Ensure `vite.config.ts` includes the necessary adapter plugins (e.g., `@hono/vite-build/cloudflare-pages`) when using Hono with Cloudflare Pages to ensure the backend logic is actually deployed.
