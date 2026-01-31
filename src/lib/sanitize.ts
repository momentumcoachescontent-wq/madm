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
      // Structure tags (for full document sanitization)
      html: ['lang'],
      head: [],
      body: ['class', 'style'],
      title: [],
      meta: ['name', 'content', 'property', 'charset'],
      link: ['rel', 'href', 'type', 'media'], // Allow stylesheets if needed, or remove if strict

      // Semantic tags
      section: ['class', 'style', 'data-madm'],
      article: ['class', 'style'],
      header: ['class', 'style'],
      footer: ['class', 'style'],
      nav: ['class', 'style'],
      main: ['class', 'style'],
      aside: ['class', 'style'],
      figure: ['class', 'style'],
      figcaption: ['class', 'style'],

      // Common formatting
      h1: ['class', 'style'], h2: ['class', 'style'], h3: ['class', 'style'],
      h4: ['class', 'style'], h5: ['class', 'style'], h6: ['class', 'style'],
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
    stripIgnoreTagBody: ['script', 'style'], // Remove content of script/style tags
    css: {
      whiteList: {
        'color': true,
        'background-color': true,
        'font-weight': true,
        'font-style': true,
        'font-size': true,
        'text-align': true,
        'text-decoration': true,
        'width': true,
        'height': true,
        'margin': true,
        'margin-top': true,
        'margin-right': true,
        'margin-bottom': true,
        'margin-left': true,
        'padding': true,
        'padding-top': true,
        'padding-right': true,
        'padding-bottom': true,
        'padding-left': true,
      }
    }
  }

  return xss(html, options)
}
