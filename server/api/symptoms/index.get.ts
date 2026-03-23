import { eq, desc, and, gte, lte } from 'drizzle-orm'
import { symptomsLog } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'
import { parseBoundedInt } from '../../utils/validate'
import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDb(event)
  const query = getQuery(event)

  const conditions = [eq(symptomsLog.userId, user.id)]
  if (query.from) conditions.push(gte(symptomsLog.date, query.from as string))
  if (query.to) conditions.push(lte(symptomsLog.date, query.to as string))

  const symptoms = await db
    .select()
    .from(symptomsLog)
    .where(and(...conditions))
    .orderBy(desc(symptomsLog.loggedAt))
    .limit(parseBoundedInt(query.limit, 100, 1, 365))
    .all()

  return { symptoms }
})
