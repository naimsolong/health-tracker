import { readBody, createError } from 'h3'
import { eq, and } from 'drizzle-orm'
import { healthEntries } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const body = await readBody(event)
  const db = useDb(event)

  if (!body.date) {
    throw createError({ statusCode: 400, message: 'Date is required' })
  }

  // Upsert: update if entry for same date exists
  const existing = await db
    .select()
    .from(healthEntries)
    .where(and(eq(healthEntries.userId, user.id), eq(healthEntries.date, body.date)))
    .get()

  if (existing) {
    const [updated] = await db
      .update(healthEntries)
      .set({
        weight: body.weight ?? existing.weight,
        bloodPressureSystolic: body.bloodPressureSystolic ?? existing.bloodPressureSystolic,
        bloodPressureDiastolic: body.bloodPressureDiastolic ?? existing.bloodPressureDiastolic,
        heartRate: body.heartRate ?? existing.heartRate,
        bloodSugar: body.bloodSugar ?? existing.bloodSugar,
        sleepHours: body.sleepHours ?? existing.sleepHours,
        steps: body.steps ?? existing.steps,
        waterIntake: body.waterIntake ?? existing.waterIntake,
        mood: body.mood ?? existing.mood,
        notes: body.notes ?? existing.notes,
        temperature: body.temperature ?? existing.temperature,
        respiratoryRate: body.respiratoryRate ?? existing.respiratoryRate,
        spo2: body.spo2 ?? existing.spo2,
        waistCircumference: body.waistCircumference ?? existing.waistCircumference,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(healthEntries.id, existing.id))
      .returning()
    return { entry: updated }
  }

  const [entry] = await db
    .insert(healthEntries)
    .values({
      userId: user.id,
      date: body.date,
      weight: body.weight,
      bloodPressureSystolic: body.bloodPressureSystolic,
      bloodPressureDiastolic: body.bloodPressureDiastolic,
      heartRate: body.heartRate,
      bloodSugar: body.bloodSugar,
      sleepHours: body.sleepHours,
      steps: body.steps,
      waterIntake: body.waterIntake,
      mood: body.mood,
      notes: body.notes,
      temperature: body.temperature,
      respiratoryRate: body.respiratoryRate,
      spo2: body.spo2,
      waistCircumference: body.waistCircumference,
    })
    .returning()

  return { entry }
})
