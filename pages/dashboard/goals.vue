<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

interface Goal {
  id: number
  goalType: string
  targetValue: number
  unit: string
}

const goals = ref<Goal[]>([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref(false)

const form = reactive({
  goalType: 'weight',
  targetValue: '',
  unit: 'kg',
})

const goalOptions = [
  { value: 'weight', label: 'Weight', unit: 'kg' },
  { value: 'steps', label: 'Daily Steps', unit: 'steps' },
  { value: 'sleep', label: 'Sleep Duration', unit: 'hours' },
  { value: 'water', label: 'Water Intake', unit: 'liters' },
  { value: 'heart_rate', label: 'Resting Heart Rate', unit: 'bpm' },
  { value: 'blood_sugar', label: 'Blood Sugar', unit: 'mmol/L' },
]

function updateUnit() {
  const option = goalOptions.find((o) => o.value === form.goalType)
  if (option) form.unit = option.unit
}

async function fetchGoals() {
  const { data, error: err } = await useFetch('/api/goals')
  if (!err.value && data.value) {
    goals.value = (data.value as { goals: Goal[] }).goals
  }
  loading.value = false
}

async function handleSubmit() {
  error.value = ''
  success.value = false
  saving.value = true
  try {
    const { error: err } = await useFetch('/api/goals', {
      method: 'POST',
      body: {
        goalType: form.goalType,
        targetValue: Number(form.targetValue),
        unit: form.unit,
      },
    })
    if (err.value) throw err.value
    success.value = true
    form.targetValue = ''
    await fetchGoals()
  } catch (e: unknown) {
    error.value = (e as { data?: { message?: string } })?.data?.message || 'Failed to save goal'
  } finally {
    saving.value = false
  }
}

onMounted(fetchGoals)
</script>

<template>
  <div class="p-6 lg:p-8 max-w-3xl mx-auto">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Health Goals</h1>
      <p class="text-gray-500 mt-1">Set targets to keep yourself motivated and on track.</p>
    </div>

    <!-- Add goal form -->
    <div class="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
      <h2 class="font-semibold text-gray-900 mb-4">Add New Goal</h2>

      <div v-if="success" class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-4 text-sm">
        Goal saved successfully!
      </div>
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Metric</label>
            <select v-model="form.goalType" @change="updateUnit"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
              <option v-for="opt in goalOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Target Value
              <span class="text-gray-400 font-normal">({{ form.unit }})</span>
            </label>
            <input v-model="form.targetValue" type="number" step="any" required placeholder="Enter target"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          </div>
        </div>

        <button type="submit" :disabled="saving"
          class="bg-emerald-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center gap-2">
          <svg v-if="saving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ saving ? 'Saving...' : 'Save Goal' }}
        </button>
      </form>
    </div>

    <!-- Goals list -->
    <div class="bg-white rounded-2xl border border-gray-100">
      <div class="px-6 py-4 border-b border-gray-100">
        <h2 class="font-semibold text-gray-900">Active Goals</h2>
      </div>

      <div v-if="loading" class="p-6 space-y-3">
        <div v-for="i in 3" :key="i" class="h-14 bg-gray-100 rounded-xl animate-pulse"></div>
      </div>

      <div v-else-if="goals.length > 0" class="divide-y divide-gray-50">
        <div v-for="goal in goals" :key="goal.id" class="px-6 py-4 flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-900 capitalize">{{ goal.goalType.replace('_', ' ') }}</p>
            <p class="text-sm text-gray-500">Target: {{ goal.targetValue }} {{ goal.unit }}</p>
          </div>
          <span class="inline-flex items-center bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">
            Active
          </span>
        </div>
      </div>

      <div v-else class="p-12 text-center">
        <p class="text-gray-500">No goals set yet. Add your first goal above!</p>
      </div>
    </div>
  </div>
</template>
