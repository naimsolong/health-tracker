import { eq, desc, and, gte } from 'drizzle-orm'
import { healthEntries } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const db = useDb(event)

  // Last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const fromDate = thirtyDaysAgo.toISOString().split('T')[0]

  const entries = await db
    .select()
    .from(healthEntries)
    .where(and(eq(healthEntries.userId, user.id), gte(healthEntries.date, fromDate)))
    .orderBy(desc(healthEntries.date))
    .all()

  if (entries.length === 0) {
    return { stats: null, entries: [] }
  }

  const withWeight = entries.filter((e) => e.weight != null)
  const withHeartRate = entries.filter((e) => e.heartRate != null)
  const withSteps = entries.filter((e) => e.steps != null)
  const withSleep = entries.filter((e) => e.sleepHours != null)

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length

  return {
    stats: {
      totalEntries: entries.length,
      avgWeight:
        withWeight.length > 0 ? avg(withWeight.map((e) => e.weight!)).toFixed(1) : null,
      latestWeight: withWeight[0]?.weight ?? null,
      avgHeartRate:
        withHeartRate.length > 0
          ? Math.round(avg(withHeartRate.map((e) => e.heartRate!)))
          : null,
      avgSteps:
        withSteps.length > 0 ? Math.round(avg(withSteps.map((e) => e.steps!))) : null,
      avgSleep:
        withSleep.length > 0 ? avg(withSleep.map((e) => e.sleepHours!)).toFixed(1) : null,
    },
    entries,
  }
})
