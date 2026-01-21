import { secureHeaders } from 'hono/secure-headers'

/**
 * Middleware de seguridad para agregar cabeceras HTTP de seguridad
 * Implementa CSP, HSTS, X-Frame-Options, etc.
 */
export const securityMiddleware = secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'", // Requerido para Tailwind CDN y algunos scripts interactivos
      "https://cdn.tailwindcss.com",
      "https://cdn.jsdelivr.net",
      "https://www.youtube.com",
      "https://s.ytimg.com",
      "https://player.vimeo.com",
      "https://js.stripe.com",
      "https://www.paypal.com",
      "https://*.paypal.com"
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Requerido para Tailwind y estilos en línea
      "https://cdn.jsdelivr.net",
      "https://fonts.googleapis.com"
    ],
    imgSrc: [
      "'self'",
      "data:",
      "https:",
      "blob:"
    ],
    fontSrc: [
      "'self'",
      "https://fonts.gstatic.com",
      "https://cdn.jsdelivr.net"
    ],
    frameSrc: [
      "'self'",
      "https://www.youtube.com",
      "https://player.vimeo.com",
      "https://js.stripe.com",
      "https://www.paypal.com",
      "https://*.paypal.com"
    ],
    connectSrc: [
      "'self'",
      "https://api.stripe.com",
      "https://www.paypal.com",
      "https://*.paypal.com"
    ],
    upgradeInsecureRequests: [],
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  xFrameOptions: "SAMEORIGIN",
  xXssProtection: "1; mode=block",
  xContentTypeOptions: "nosniff",
  referrerPolicy: "strict-origin-when-cross-origin",
  strictTransportSecurity: "max-age=31536000; includeSubDomains; preload"
})
