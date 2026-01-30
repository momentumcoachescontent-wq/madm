/**
 * Lightweight HTML Sanitizer for Cloudflare Workers
 *
 * Removes <script> tags, event handlers, and javascript: URIs.
 * Optimized for Cloudflare Workers where 'sanitize-html' (Node.js) causes errors.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''

  let clean = html

  // 1. Remove script tags and their content
  // <script ...>...</script>
  clean = clean.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")

  // 2. Remove event handlers (on*)
  // Catches: onclick="...", onmouseover='...', onerror=alert(1)
  // Logic: \s+ (space) on[a-z]+ (event name) \s*=\s* (equals)
  // Then either: "[^"]*" (double quoted), '[^']*' (single quoted), or [^\s>]+ (unquoted value until space or >)
  clean = clean.replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gim, "")

  // 3. Remove javascript: protocol in href/src
  // Catches: href="javascript:...", src='javascript:...', href=javascript:alert(1)
  clean = clean.replace(/\s+(href|src)\s*=\s*("javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gim, ' $1="#"')

  return clean
}
