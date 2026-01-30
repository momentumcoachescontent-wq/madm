import xss from 'xss'

/**
 * Lightweight HTML Sanitizer for Cloudflare Workers
 *
 * Uses 'xss' library which is pure JS and cleaner than regex-based approaches.
 * It is compatible with Cloudflare Workers.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''

  // Configure xss to allow common tags/attributes but strip scripts/on*
  const options = {
    whiteList: {
      ...xss.whiteList,
      // Add or customize allowed tags if needed.
      // xss defaults are usually safe for blog posts (p, b, i, a, img, etc).
      // We explicitly allow common formatting tags.
      h1: [], h2: [], h3: [], h4: [], h5: [], h6: [],
      p: ['class', 'style'],
      div: ['class', 'style'],
      span: ['class', 'style'],
      img: ['src', 'alt', 'title', 'width', 'height', 'class', 'style'],
      a: ['href', 'title', 'target', 'class', 'style'],
      ul: ['class'], ol: ['class'], li: ['class'],
      b: [], i: [], u: [], strong: [], em: [], br: [], hr: [],
      blockquote: ['class'], pre: ['class'], code: ['class']
    },
    stripIgnoreTag: true, // Filter out tags not in whitelist
    stripIgnoreTagBody: ['script', 'style'] // Remove content of script/style tags
  }

  return xss(html, options)
}
