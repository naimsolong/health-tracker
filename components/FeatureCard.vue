<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  description: string
}>()

const iconPaths: Record<string, string> = {
  weight:
    'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
  heart: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  sleep: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
  steps:
    'M13 10V3L4 14h7v7l9-11h-7z',
  water:
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z',
  mood: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
}
</script>

<template>
  <div
    class="bg-white rounded-2xl p-6 border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all group">
    <div
      class="w-12 h-12 bg-emerald-50 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center mb-4 transition-colors">
      <svg class="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          :d="iconPaths[icon] || iconPaths.heart" />
      </svg>
    </div>
    <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ title }}</h3>
    <p class="text-gray-500 text-sm leading-relaxed">{{ description }}</p>
  </div>
</template>
