import { readBody } from 'h3'
import { eq } from 'drizzle-orm'
import { userMedicalProfile } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const body = await readBody(event)
  const db = useDb(event)

  const payload = {
    height: body.height ?? null,
    bloodType: body.bloodType ?? null,
    dateOfBirth: body.dateOfBirth ?? null,
    biologicalSex: body.biologicalSex ?? null,
    smokingStatus: body.smokingStatus ?? null,
    alcoholUse: body.alcoholUse ?? null,
    allergies: Array.isArray(body.allergies) ? JSON.stringify(body.allergies) : null,
    chronicConditions: Array.isArray(body.chronicConditions)
      ? JSON.stringify(body.chronicConditions)
      : null,
    currentMedications: Array.isArray(body.currentMedications)
      ? JSON.stringify(body.currentMedications)
      : null,
    familyHistory: Array.isArray(body.familyHistory) ? JSON.stringify(body.familyHistory) : null,
    notes: body.notes ?? null,
    updatedAt: new Date().toISOString(),
  }

  const existing = await db
    .select({ id: userMedicalProfile.id })
    .from(userMedicalProfile)
    .where(eq(userMedicalProfile.userId, user.id))
    .get()

  if (existing) {
    await db
      .update(userMedicalProfile)
      .set(payload)
      .where(eq(userMedicalProfile.userId, user.id))
  } else {
    await db.insert(userMedicalProfile).values({ userId: user.id, ...payload })
  }

  return { message: 'Medical profile saved' }
})
