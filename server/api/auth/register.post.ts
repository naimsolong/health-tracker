import { readBody, createError, setCookie } from 'h3'
import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'
import { hashPassword, signToken } from '../../utils/auth'
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, password } = body

  if (!name || !email || !password) {
    throw createError({ statusCode: 400, message: 'Name, email, and password are required' })
  }

  if (password.length < 8) {
    throw createError({ statusCode: 400, message: 'Password must be at least 8 characters' })
  }

  const db = useDb(event)

  const existing = await db.select().from(users).where(eq(users.email, email)).get()
  if (existing) {
    throw createError({ statusCode: 409, message: 'Email already registered' })
  }

  const passwordHash = await hashPassword(password)

  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash })
    .returning({ id: users.id, name: users.name, email: users.email })

  const config = useRuntimeConfig(event)
  const token = signToken({ userId: user.id, email: user.email }, config.jwtSecret)

  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return { user, token }
})
