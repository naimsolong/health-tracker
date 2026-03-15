<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { entries, fetchEntries, deleteEntry } = useHealthEntries()

const loading = ref(true)
const deleting = ref<number | null>(null)
const error = ref('')

onMounted(async () => {
  await fetchEntries({ limit: 90 })
  loading.value = false
})

async function handleDelete(id: number) {
  if (!confirm('Delete this entry?')) return
  deleting.value = id
  try {
    await deleteEntry(id)
  } catch {
    error.value = 'Failed to delete entry'
  } finally {
    deleting.value = null
  }
}
</script>

<template>
  <div class="p-6 lg:p-8 max-w-5xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">History</h1>
        <p class="text-gray-500 mt-1">Your health entries for the last 90 days</p>
      </div>
      <NuxtLink to="/dashboard/log"
        class="flex items-center gap-2 bg-emerald-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-emerald-600 transition-colors">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Entry
      </NuxtLink>
    </div>

    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
      {{ error }}
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-32 mb-3"></div>
        <div class="grid grid-cols-4 gap-4">
          <div class="h-3 bg-gray-100 rounded"></div>
          <div class="h-3 bg-gray-100 rounded"></div>
          <div class="h-3 bg-gray-100 rounded"></div>
          <div class="h-3 bg-gray-100 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Entries list -->
    <div v-else-if="entries.length > 0" class="space-y-3">
      <div v-for="entry in entries" :key="entry.id"
        class="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
        <div class="flex items-start justify-between mb-4">
          <span class="font-semibold text-gray-900">{{ entry.date }}</span>
          <button @click="handleDelete(entry.id)" :disabled="deleting === entry.id"
            class="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50">
            <svg v-if="deleting === entry.id" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <MetricBadge v-if="entry.weight" label="Weight" :value="`${entry.weight} kg`" />
          <MetricBadge v-if="entry.heartRate" label="Heart Rate" :value="`${entry.heartRate} bpm`" />
          <MetricBadge v-if="entry.bloodPressureSystolic && entry.bloodPressureDiastolic" label="BP" :value="`${entry.bloodPressureSystolic}/${entry.bloodPressureDiastolic}`" />
          <MetricBadge v-if="entry.bloodSugar" label="Blood Sugar" :value="`${entry.bloodSugar} mmol/L`" />
          <MetricBadge v-if="entry.sleepHours" label="Sleep" :value="`${entry.sleepHours} hrs`" />
          <MetricBadge v-if="entry.steps" label="Steps" :value="entry.steps.toLocaleString()" />
          <MetricBadge v-if="entry.waterIntake" label="Water" :value="`${entry.waterIntake} L`" />
          <MetricBadge v-if="entry.mood" label="Mood" :value="`${entry.mood}/10`" />
        </div>

        <p v-if="entry.notes" class="mt-3 text-sm text-gray-500 italic">{{ entry.notes }}</p>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="bg-white rounded-2xl border border-gray-100 p-12 text-center">
      <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">No history yet</h3>
      <p class="text-gray-500 mb-6">Start logging your health metrics to see them here.</p>
      <NuxtLink to="/dashboard/log"
        class="inline-flex items-center gap-2 bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-emerald-600 transition-colors">
        Log first entry
      </NuxtLink>
    </div>
  </div>
</template>
