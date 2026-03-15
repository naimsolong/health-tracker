<script setup lang="ts">
defineProps<{
  label: string
  value: string
}>()
</script>

<template>
  <div class="bg-gray-50 rounded-lg px-3 py-2">
    <p class="text-xs text-gray-500 mb-0.5">{{ label }}</p>
    <p class="text-sm font-semibold text-gray-900">{{ value }}</p>
  </div>
</template>
