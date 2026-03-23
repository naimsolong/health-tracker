import { eq, desc, and, gte, lte } from 'drizzle-orm'
import { healthEntries } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'
import { parseBoundedInt } from '../../utils/validate'
import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDb(event)
  const query = getQuery(event)

  const conditions = [eq(healthEntries.userId, user.id)]

  if (query.from) {
    conditions.push(gte(healthEntries.date, query.from as string))
  }
  if (query.to) {
    conditions.push(lte(healthEntries.date, query.to as string))
  }

  const entries = await db
    .select()
    .from(healthEntries)
    .where(and(...conditions))
    .orderBy(desc(healthEntries.date))
    .limit(parseBoundedInt(query.limit, 30, 1, 365))
    .all()

  return { entries }
})
