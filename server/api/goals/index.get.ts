import { eq, and } from 'drizzle-orm'
import { userGoals } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDb(event)

  const goals = await db
    .select()
    .from(userGoals)
    .where(and(eq(userGoals.userId, user.id), eq(userGoals.isActive, true)))
    .all()

  return { goals }
})
