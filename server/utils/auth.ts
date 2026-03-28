import { H3Event, getCookie, createError } from 'h3'

const encoder = new TextEncoder()

// ─── Constant-time string comparison (prevent timing attacks) ───────────────
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

// ─── JWT (HMAC-SHA256) ───────────────────────────────────────────────────────
export async function signToken(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const data = btoa(JSON.stringify({ ...payload, iat: Date.now() }))
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(`${header}.${data}`))
  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)))
  return `${header}.${data}.${sig}`
}

export async function verifyToken(
  token: string,
  secret: string,
): Promise<Record<string, unknown> | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    )

    const sigBytes = Uint8Array.from(atob(parts[2]), (c) => c.charCodeAt(0))
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      encoder.encode(`${parts[0]}.${parts[1]}`),
    )

    if (!valid) return null
    return JSON.parse(atob(parts[1]))
  } catch {
    return null
  }
}

// ─── Password hashing (PBKDF2 with random salt) ──────────────────────────────
// Stored format: "pbkdf2:310000:<saltHex>:<hashHex>"
// Legacy format (SHA-256 only, no prefix): 64-char hex — supported for migration.

const PBKDF2_ITERATIONS = 310_000

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  const hashBuffer = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    256,
  )
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `pbkdf2:${PBKDF2_ITERATIONS}:${saltHex}:${hashHex}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored.startsWith('pbkdf2:')) {
    // Legacy SHA-256 path — verify for existing users, hash will be upgraded on next login
    const legacyHash = await legacySha256(password)
    return timingSafeEqual(legacyHash, stored)
  }

  const parts = stored.split(':')
  if (parts.length !== 4) return false

  const iterations = Number(parts[1])
  const salt = new Uint8Array(parts[2].match(/.{2}/g)!.map((b) => parseInt(b, 16)))

  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  const hashBuffer = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    256,
  )
  const computed = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return timingSafeEqual(computed, parts[3])
}

// Legacy SHA-256 (kept only for migration verification — never used to store new hashes)
async function legacySha256(password: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(password))
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// ─── Auth helpers ────────────────────────────────────────────────────────────
export async function getAuthUser(event: H3Event): Promise<{ id: number; email: string } | null> {
  const config = useRuntimeConfig(event)
  const token =
    getCookie(event, 'auth_token') || event.node.req.headers.authorization?.replace('Bearer ', '')

  if (!token) return null

  const payload = await verifyToken(token, config.jwtSecret)
  if (!payload || !payload.userId) return null

  return { id: payload.userId as number, email: payload.email as string }
}

export async function requireAuth(event: H3Event): Promise<{ id: number; email: string }> {
  const user = await getAuthUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }
  return user
}
