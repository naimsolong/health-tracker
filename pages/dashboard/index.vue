<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { fetchStats } = useHealthEntries()
const { user } = useAuth()

const statsData = ref<{
  stats: Record<string, string | number | null> | null
  entries: { date: string; mood: number | null; steps: number | null }[]
} | null>(null)

const loading = ref(true)

onMounted(async () => {
  statsData.value = await fetchStats()
  loading.value = false
})

const stats = computed(() => statsData.value?.stats ?? null)
const recentEntries = computed(() => statsData.value?.entries?.slice(0, 7) ?? [])

const metricCards = computed(() => [
  { label: 'Avg Weight', value: stats.value?.avgWeight ? `${stats.value.avgWeight} kg` : '—', icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5', color: 'blue' },
  { label: 'Avg Heart Rate', value: stats.value?.avgHeartRate ? `${stats.value.avgHeartRate} bpm` : '—', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: 'red' },
  { label: 'Avg Steps', value: stats.value?.avgSteps ? `${(stats.value.avgSteps as number).toLocaleString()}` : '—', icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'emerald' },
  { label: 'Avg Sleep', value: stats.value?.avgSleep ? `${stats.value.avgSleep} hrs` : '—', icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z', color: 'purple' },
])

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600',
  red: 'bg-red-50 text-red-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  purple: 'bg-purple-50 text-purple-600',
}
</script>

<template>
  <div class="p-6 lg:p-8 max-w-6xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">
        Good {{ new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening' }}, {{ user?.name?.split(' ')[0] }} 👋
      </h1>
      <p class="text-gray-500 mt-1">Here's your health overview for the last 30 days</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="i in 4" :key="i" class="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-24 mb-3"></div>
        <div class="h-8 bg-gray-200 rounded w-32"></div>
      </div>
    </div>

    <!-- Stats cards -->
    <div v-else-if="stats" class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="card in metricCards" :key="card.label"
        class="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-sm transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm text-gray-500">{{ card.label }}</span>
          <div :class="['w-9 h-9 rounded-lg flex items-center justify-center', colorMap[card.color]]">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="card.icon" />
            </svg>
          </div>
        </div>
        <p class="text-2xl font-bold text-gray-900">{{ card.value }}</p>
        <p class="text-xs text-gray-400 mt-1">Last 30 days</p>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else
      class="bg-white rounded-2xl border border-gray-100 p-12 text-center mb-8">
      <div class="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">No entries yet</h3>
      <p class="text-gray-500 mb-6">Start logging your health metrics to see insights here.</p>
      <NuxtLink to="/dashboard/log"
        class="inline-flex items-center gap-2 bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-emerald-600 transition-colors">
        Log your first entry
      </NuxtLink>
    </div>

    <!-- Recent entries table -->
    <div v-if="recentEntries.length > 0" class="bg-white rounded-2xl border border-gray-100">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 class="font-semibold text-gray-900">Recent Entries</h2>
        <NuxtLink to="/dashboard/history"
          class="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
          View all →
        </NuxtLink>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
              <th class="text-left px-6 py-3 text-gray-500 font-medium">Steps</th>
              <th class="text-left px-6 py-3 text-gray-500 font-medium">Mood</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in recentEntries" :key="entry.date"
              class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td class="px-6 py-3 text-gray-900 font-medium">{{ entry.date }}</td>
              <td class="px-6 py-3 text-gray-600">{{ entry.steps?.toLocaleString() || '—' }}</td>
              <td class="px-6 py-3">
                <span v-if="entry.mood"
                  class="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-medium px-2 py-1 rounded-full">
                  {{ entry.mood }}/10
                </span>
                <span v-else class="text-gray-400">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="mt-6 grid sm:grid-cols-2 gap-4">
      <NuxtLink to="/dashboard/log"
        class="flex items-center gap-4 bg-emerald-500 text-white p-5 rounded-2xl hover:bg-emerald-600 transition-colors group">
        <div class="w-10 h-10 bg-emerald-400 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div>
          <p class="font-semibold">Log Today's Metrics</p>
          <p class="text-emerald-100 text-sm">Add today's health data</p>
        </div>
      </NuxtLink>
      <NuxtLink to="/dashboard/goals"
        class="flex items-center gap-4 bg-white border border-gray-100 p-5 rounded-2xl hover:shadow-sm transition-shadow group">
        <div class="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <div>
          <p class="font-semibold text-gray-900">Set Health Goals</p>
          <p class="text-gray-500 text-sm">Define your targets</p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
