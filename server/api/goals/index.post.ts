import { readBody, createError } from 'h3'
import { userGoals } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'
import { assertMaxLength } from '../../utils/validate'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const db = useDb(event)

  const { goalType, targetValue, unit } = body
  if (!goalType || targetValue == null || !unit) {
    throw createError({ statusCode: 400, message: 'goalType, targetValue, and unit are required' })
  }
  assertMaxLength(goalType, 'goalType', 100)
  assertMaxLength(unit, 'unit', 50)

  const [goal] = await db
    .insert(userGoals)
    .values({ userId: user.id, goalType, targetValue, unit })
    .returning()

  return { goal }
})
