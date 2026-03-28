import { readBody, createError, setCookie } from 'h3'
import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'
import { hashPassword, signToken } from '../../utils/auth'
import { useDb } from '../../utils/db'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  // Registration is currently disabled — remove this throw to re-enable
  throw createError({ statusCode: 404, message: 'Not found' })

  // eslint-disable-next-line no-unreachable
  const body = await readBody(event)
  const { name, email, password } = body

  if (!name || !email || !password) {
    throw createError({ statusCode: 400, message: 'Name, email, and password are required' })
  }

  if (typeof name !== 'string' || name.length > 100) {
    throw createError({ statusCode: 400, message: 'Name must be 100 characters or fewer' })
  }

  if (typeof email !== 'string' || email.length > 254 || !EMAIL_RE.test(email)) {
    throw createError({ statusCode: 400, message: 'Invalid email address' })
  }

  if (typeof password !== 'string' || password.length < 8) {
    throw createError({ statusCode: 400, message: 'Password must be at least 8 characters' })
  }

  if (password.length > 1024) {
    throw createError({ statusCode: 400, message: 'Password too long' })
  }

  const db = useDb(event)

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).get()
  if (existing) {
    // Generic message — do not confirm whether the email exists (prevents enumeration)
    throw createError({ statusCode: 409, message: 'Unable to create account with that email address' })
  }

  const passwordHash = await hashPassword(password)

  const [user] = await db
    .insert(users)
    .values({ name: name.trim(), email: email.toLowerCase().trim(), passwordHash })
    .returning({ id: users.id, name: users.name, email: users.email })

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
  return { user }
})
