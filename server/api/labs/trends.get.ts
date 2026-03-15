import { eq, and, asc, gte } from 'drizzle-orm'
import { labResults } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'
import { getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const db = useDb(event)
  const query = getQuery(event)

  if (!query.test) {
    throw createError({ statusCode: 400, message: 'test query param is required' })
  }

  const conditions = [
    eq(labResults.userId, user.id),
    eq(labResults.testName, query.test as string),
  ]

  if (query.from) {
    conditions.push(gte(labResults.testDate, query.from as string))
  }

  const results = await db
    .select({
      testDate: labResults.testDate,
      value: labResults.value,
      unit: labResults.unit,
      referenceLow: labResults.referenceLow,
      referenceHigh: labResults.referenceHigh,
    })
    .from(labResults)
    .where(and(...conditions))
    .orderBy(asc(labResults.testDate))
    .all()

  return { test: query.test, results }
})
