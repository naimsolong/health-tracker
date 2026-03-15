export interface HealthEntry {
  id: number
  userId: number
  date: string
  weight: number | null
  bloodPressureSystolic: number | null
  bloodPressureDiastolic: number | null
  heartRate: number | null
  bloodSugar: number | null
  sleepHours: number | null
  steps: number | null
  waterIntake: number | null
  mood: number | null
  notes: string | null
}

export function useHealthEntries() {
  const entries = useState<HealthEntry[]>('health-entries', () => [])

  async function fetchEntries(params?: { from?: string; to?: string; limit?: number }) {
    const { data, error } = await useFetch('/api/health', { query: params })
    if (!error.value && data.value) {
      entries.value = (data.value as { entries: HealthEntry[] }).entries
    }
    return entries.value
  }

  async function saveEntry(entry: Partial<HealthEntry>) {
    const { data, error } = await useFetch('/api/health', {
      method: 'POST',
      body: entry,
    })
    if (error.value) throw error.value
    return (data.value as { entry: HealthEntry }).entry
  }

  async function deleteEntry(id: number) {
    const { error } = await useFetch(`/api/health/${id}`, { method: 'DELETE' })
    if (error.value) throw error.value
    entries.value = entries.value.filter((e) => e.id !== id)
  }

  async function fetchStats() {
    const { data, error } = await useFetch('/api/health/stats')
    if (error.value) return null
    return data.value as { stats: Record<string, unknown> | null; entries: HealthEntry[] }
  }

  return { entries, fetchEntries, saveEntry, deleteEntry, fetchStats }
}
