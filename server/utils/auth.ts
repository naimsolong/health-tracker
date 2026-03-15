import { H3Event, getCookie, createError } from 'h3'

// Simple JWT-like token using base64 (for demo; use jose/jsonwebtoken in production)
export function signToken(payload: Record<string, unknown>, secret: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const data = btoa(JSON.stringify({ ...payload, iat: Date.now() }))
  // Simplified signature (use proper HMAC in production)
  const sig = btoa(`${header}.${data}.${secret}`.slice(0, 32))
  return `${header}.${data}.${sig}`
}

export function verifyToken(token: string, secret: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1]))
    // Verify signature
    const expectedSig = btoa(`${parts[0]}.${parts[1]}.${secret}`.slice(0, 32))
    if (parts[2] !== expectedSig) return null
    return payload
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

export function getAuthUser(event: H3Event): { id: number; email: string } | null {
  const config = useRuntimeConfig(event)
  const token =
    getCookie(event, 'auth_token') || event.node.req.headers.authorization?.replace('Bearer ', '')

  if (!token) return null

  const payload = verifyToken(token, config.jwtSecret)
  if (!payload || !payload.userId) return null

  return { id: payload.userId as number, email: payload.email as string }
}

export function requireAuth(event: H3Event): { id: number; email: string } {
  const user = getAuthUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }
  return user
}
