import { eq } from 'drizzle-orm'
import { userMedicalProfile } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDb(event)

  const profile = await db
    .select()
    .from(userMedicalProfile)
    .where(eq(userMedicalProfile.userId, user.id))
    .get()

  if (!profile) return { profile: null }

  return {
    profile: {
      ...profile,
      allergies: profile.allergies ? JSON.parse(profile.allergies) : [],
      chronicConditions: profile.chronicConditions ? JSON.parse(profile.chronicConditions) : [],
      currentMedications: profile.currentMedications
        ? JSON.parse(profile.currentMedications)
        : [],
      familyHistory: profile.familyHistory ? JSON.parse(profile.familyHistory) : [],
    },
  }
})
