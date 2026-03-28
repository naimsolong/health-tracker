import { readBody, createError } from 'h3'
import { symptomsLog } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'
import { assertMaxLength } from '../../utils/validate'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const db = useDb(event)

  if (!body.symptom) {
    throw createError({ statusCode: 400, message: 'symptom is required' })
  }
  assertMaxLength(body.symptom, 'symptom', 200)
  assertMaxLength(body.notes, 'notes', 2000)

  const now = new Date()
  const loggedAt = now.toISOString().replace('T', ' ').split('.')[0]
  const date = body.date ?? now.toISOString().split('T')[0]

  const [symptom] = await db
    .insert(symptomsLog)
    .values({
      userId: user.id,
      loggedAt,
      date,
      symptom: body.symptom,
      severity: body.severity ? Number(body.severity) : null,
      durationMin: body.durationMin ? Number(body.durationMin) : null,
      notes: body.notes ?? null,
    })
    .returning()

  return { symptom }
})
