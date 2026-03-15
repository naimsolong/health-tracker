import { eq, and } from 'drizzle-orm'
import { labResults } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'
import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const db = useDb(event)
  const id = Number(event.context.params?.id)

  if (!id) throw createError({ statusCode: 400, message: 'Invalid ID' })

  const existing = await db
    .select()
    .from(labResults)
    .where(and(eq(labResults.id, id), eq(labResults.userId, user.id)))
    .get()

  if (!existing) throw createError({ statusCode: 404, message: 'Not found' })

  await db.delete(labResults).where(and(eq(labResults.id, id), eq(labResults.userId, user.id)))

  return { message: 'Deleted' }
})
