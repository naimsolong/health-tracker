import { eq, and } from 'drizzle-orm'
import { symptomsLog } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'
import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDb(event)
  const id = Number(event.context.params?.id)

  if (!id) throw createError({ statusCode: 400, message: 'Invalid ID' })

  const existing = await db
    .select()
    .from(symptomsLog)
    .where(and(eq(symptomsLog.id, id), eq(symptomsLog.userId, user.id)))
    .get()

  if (!existing) throw createError({ statusCode: 404, message: 'Not found' })

  await db.delete(symptomsLog).where(and(eq(symptomsLog.id, id), eq(symptomsLog.userId, user.id)))

  return { message: 'Deleted' }
})
