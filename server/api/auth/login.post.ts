import { readBody, createError, setCookie } from 'h3'
import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'
import { verifyPassword, signToken, hashPassword } from '../../utils/auth'
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({ statusCode: 400, message: 'Email and password are required' })
  }

  const db = useDb(event)
  const user = await db.select().from(users).where(eq(users.email, email)).get()

  // Always run verifyPassword (even for a dummy hash) to prevent timing-based user enumeration
  const isValid = user ? await verifyPassword(password, user.passwordHash) : false

  if (!user || !isValid) {
    throw createError({ statusCode: 401, message: 'Invalid credentials' })
  }

  // Opportunistic PBKDF2 upgrade: if user still has a legacy SHA-256 hash, upgrade it silently
  if (!user.passwordHash.startsWith('pbkdf2:')) {
    const newHash = await hashPassword(password)
    await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, user.id))
  }

  const config = useRuntimeConfig(event)
  const token = await signToken({ userId: user.id, email: user.email }, config.jwtSecret)

  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  // Do NOT return the raw token — httpOnly cookie is the only delivery mechanism
  return {
    user: { id: user.id, name: user.name, email: user.email },
  }
})
