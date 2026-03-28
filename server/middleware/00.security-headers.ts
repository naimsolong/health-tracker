/**
 * Security response headers applied to every request.
 * For Cloudflare deployments, these can alternatively be set as Transform Rules
 * in the Cloudflare dashboard for zero-latency edge enforcement.
 */
export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    // Prevent MIME-type sniffing
    'X-Content-Type-Options': 'nosniff',
    // Disallow framing (clickjacking protection)
    'X-Frame-Options': 'DENY',
    // Limit referrer information sent to third parties
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Disable unused browser features
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    // CSP: tighten as the app matures (unsafe-inline required by Nuxt SSR for now)
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data:",
      "connect-src 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
    ].join('; '),
  })
})
