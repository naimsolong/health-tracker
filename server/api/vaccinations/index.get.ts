import { eq, desc } from 'drizzle-orm'
import { vaccinations } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const db = useDb(event)

  const records = await db
    .select()
    .from(vaccinations)
    .where(eq(vaccinations.userId, user.id))
    .orderBy(desc(vaccinations.dateGiven))
    .all()

  return { vaccinations: records }
})
