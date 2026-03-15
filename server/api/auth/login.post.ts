import { readBody, createError, setCookie } from 'h3'
import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'
import { verifyPassword, signToken } from '../../utils/auth'
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({ statusCode: 400, message: 'Email and password are required' })
  }

  const db = useDb(event)
  const user = await db.select().from(users).where(eq(users.email, email)).get()

  if (!user) {
    throw createError({ statusCode: 401, message: 'Invalid credentials' })
  }

  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) {
    throw createError({ statusCode: 401, message: 'Invalid credentials' })
  }

  const config = useRuntimeConfig(event)
  const token = signToken({ userId: user.id, email: user.email }, config.jwtSecret)

  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return {
    user: { id: user.id, name: user.name, email: user.email },
    token,
  }
})
