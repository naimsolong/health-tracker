import { eq, and } from 'drizzle-orm'
import { healthEntries } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'
import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDb(event)
  const id = Number(event.context.params?.id)

  if (!id) throw createError({ statusCode: 400, message: 'Invalid entry ID' })

  const entry = await db
    .select()
    .from(healthEntries)
    .where(and(eq(healthEntries.id, id), eq(healthEntries.userId, user.id)))
    .get()

  if (!entry) throw createError({ statusCode: 404, message: 'Entry not found' })

  await db
    .delete(healthEntries)
    .where(and(eq(healthEntries.id, id), eq(healthEntries.userId, user.id)))

  return { message: 'Entry deleted successfully' }
})
