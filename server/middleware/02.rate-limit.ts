/**
 * In-memory rate limiter for auth endpoints.
 *
 * NOTE: Cloudflare Workers isolate memory per-request, so this in-memory store
 * resets on every cold start. For production enforcement configure a
 * Cloudflare Rate Limiting rule (Security → WAF → Rate Limiting) targeting
 * /api/auth/* with a limit of ~5 req/min per IP — no code change required.
 * This middleware provides a best-effort layer that works in local dev and on
 * long-lived runtime environments.
 */

interface WindowEntry {
  count: number
  resetAt: number
}

const store = new Map<string, WindowEntry>()

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  '/api/auth/login': { max: 5, windowMs: 60_000 },
  '/api/auth/register': { max: 5, windowMs: 60_000 },
}

// Periodically purge expired entries to prevent unbounded memory growth
let lastCleanup = Date.now()
function maybeCleanup() {
  const now = Date.now()
  if (now - lastCleanup < 60_000) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key)
  }
}

export default defineEventHandler((event) => {
  const url = event.node.req.url || '/'
  const pathname = url.split('?')[0]
  const limit = LIMITS[pathname]
  if (!limit) return

  maybeCleanup()

  // Use Cloudflare's trusted header first, then fallback for local dev
  const ip =
    getRequestHeader(event, 'cf-connecting-ip') ||
    getRequestHeader(event, 'x-forwarded-for')?.split(',')[0].trim() ||
    event.node.req.socket?.remoteAddress ||
    'unknown'

  const key = `${ip}:${pathname}`
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + limit.windowMs })
    return
  }

  entry.count++

  if (entry.count > limit.max) {
    setResponseHeader(event, 'Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)))
    throw createError({
      statusCode: 429,
      message: 'Too many requests. Please wait before trying again.',
    })
  }
})
