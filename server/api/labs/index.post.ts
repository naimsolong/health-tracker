import { readBody, createError } from 'h3'
import { labResults } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'
import { assertMaxLength } from '../../utils/validate'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const db = useDb(event)

  const { testDate, testCategory, testName, value, unit } = body
  if (!testDate || !testCategory || !testName || value == null || !unit) {
    throw createError({
      statusCode: 400,
      message: 'testDate, testCategory, testName, value, and unit are required',
    })
  }
  assertMaxLength(testCategory, 'testCategory', 100)
  assertMaxLength(testName, 'testName', 200)
  assertMaxLength(unit, 'unit', 50)
  assertMaxLength(body.labName, 'labName', 200)
  assertMaxLength(body.orderedBy, 'orderedBy', 200)
  assertMaxLength(body.notes, 'notes', 2000)

  const [result] = await db
    .insert(labResults)
    .values({
      userId: user.id,
      testDate,
      testCategory,
      testName,
      value: Number(value),
      unit,
      referenceLow: body.referenceLow != null ? Number(body.referenceLow) : null,
      referenceHigh: body.referenceHigh != null ? Number(body.referenceHigh) : null,
      labName: body.labName ?? null,
      orderedBy: body.orderedBy ?? null,
      notes: body.notes ?? null,
    })
    .returning()

  return { result }
})
