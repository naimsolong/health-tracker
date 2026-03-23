import { eq, desc, and, gte } from 'drizzle-orm'
import { labResults } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'
import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDb(event)
  const query = getQuery(event)

  const conditions = [eq(labResults.userId, user.id)]
  if (query.category) {
    conditions.push(eq(labResults.testCategory, query.category as string))
  }
  if (query.from) {
    conditions.push(gte(labResults.testDate, query.from as string))
  }

  const results = await db
    .select()
    .from(labResults)
    .where(and(...conditions))
    .orderBy(desc(labResults.testDate))
    .all()

  return { results }
})
