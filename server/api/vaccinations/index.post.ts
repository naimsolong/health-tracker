import { readBody, createError } from 'h3'
import { vaccinations } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'
import { assertMaxLength } from '../../utils/validate'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const db = useDb(event)

  if (!body.vaccineName || !body.dateGiven) {
    throw createError({ statusCode: 400, message: 'vaccineName and dateGiven are required' })
  }
  assertMaxLength(body.vaccineName, 'vaccineName', 200)
  assertMaxLength(body.manufacturer, 'manufacturer', 200)
  assertMaxLength(body.lotNumber, 'lotNumber', 100)
  assertMaxLength(body.administeredBy, 'administeredBy', 200)
  assertMaxLength(body.notes, 'notes', 2000)

  const [record] = await db
    .insert(vaccinations)
    .values({
      userId: user.id,
      vaccineName: body.vaccineName,
      dateGiven: body.dateGiven,
      doseNumber: body.doseNumber ? Number(body.doseNumber) : null,
      manufacturer: body.manufacturer ?? null,
      lotNumber: body.lotNumber ?? null,
      administeredBy: body.administeredBy ?? null,
      nextDueDate: body.nextDueDate ?? null,
      notes: body.notes ?? null,
    })
    .returning()

  return { vaccination: record }
})
