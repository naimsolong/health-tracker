<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { saveEntry } = useHealthEntries()

const today = new Date().toISOString().split('T')[0]

const form = reactive({
  date: today,
  weight: '',
  bloodPressureSystolic: '',
  bloodPressureDiastolic: '',
  heartRate: '',
  bloodSugar: '',
  sleepHours: '',
  steps: '',
  waterIntake: '',
  mood: '',
  notes: '',
})

const loading = ref(false)
const success = ref(false)
const error = ref('')

async function handleSubmit() {
  loading.value = true
  error.value = ''
  success.value = false

  try {
    const payload = {
      date: form.date,
      weight: form.weight ? Number(form.weight) : undefined,
      bloodPressureSystolic: form.bloodPressureSystolic ? Number(form.bloodPressureSystolic) : undefined,
      bloodPressureDiastolic: form.bloodPressureDiastolic ? Number(form.bloodPressureDiastolic) : undefined,
      heartRate: form.heartRate ? Number(form.heartRate) : undefined,
      bloodSugar: form.bloodSugar ? Number(form.bloodSugar) : undefined,
      sleepHours: form.sleepHours ? Number(form.sleepHours) : undefined,
      steps: form.steps ? Number(form.steps) : undefined,
      waterIntake: form.waterIntake ? Number(form.waterIntake) : undefined,
      mood: form.mood ? Number(form.mood) : undefined,
      notes: form.notes || undefined,
    }

    await saveEntry(payload)
    success.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e: unknown) {
    error.value = (e as { data?: { message?: string } })?.data?.message || 'Failed to save entry'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-6 lg:p-8 max-w-3xl mx-auto">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Log Health Entry</h1>
      <p class="text-gray-500 mt-1">Record your health metrics. Fill in any combination of fields.</p>
    </div>

    <div v-if="success" class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-4 rounded-xl mb-6 flex items-center gap-3">
      <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Entry saved successfully!
    </div>
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6">
      {{ error }}
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Date -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 class="font-semibold text-gray-900 mb-4">Date</h2>
        <input v-model="form.date" type="date" required
          class="w-full sm:w-auto px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
      </div>

      <!-- Body Metrics -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 class="font-semibold text-gray-900 mb-4">Body Metrics</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
            <input v-model="form.weight" type="number" step="0.1" min="0" max="500" placeholder="70.5"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Heart Rate (bpm)</label>
            <input v-model="form.heartRate" type="number" min="0" max="300" placeholder="72"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Blood Sugar (mmol/L)</label>
            <input v-model="form.bloodSugar" type="number" step="0.1" min="0" placeholder="5.4"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          </div>
        </div>
      </div>

      <!-- Blood Pressure -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 class="font-semibold text-gray-900 mb-4">Blood Pressure</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Systolic (mmHg)</label>
            <input v-model="form.bloodPressureSystolic" type="number" min="0" max="300" placeholder="120"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Diastolic (mmHg)</label>
            <input v-model="form.bloodPressureDiastolic" type="number" min="0" max="200" placeholder="80"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          </div>
        </div>
      </div>

      <!-- Lifestyle -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 class="font-semibold text-gray-900 mb-4">Lifestyle</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Sleep (hours)</label>
            <input v-model="form.sleepHours" type="number" step="0.5" min="0" max="24" placeholder="7.5"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Steps</label>
            <input v-model="form.steps" type="number" min="0" placeholder="8000"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Water Intake (L)</label>
            <input v-model="form.waterIntake" type="number" step="0.1" min="0" placeholder="2.0"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Mood (1-10)
              <span v-if="form.mood" class="text-emerald-600 font-semibold ml-1">{{ form.mood }}</span>
            </label>
            <input v-model="form.mood" type="range" min="1" max="10" step="1"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
            <div class="flex justify-between text-xs text-gray-400 mt-1">
              <span>1 (Poor)</span>
              <span>10 (Great)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 class="font-semibold text-gray-900 mb-4">Notes</h2>
        <textarea v-model="form.notes" rows="3" placeholder="Any observations or notes for today..."
          class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"></textarea>
      </div>

      <div class="flex gap-4">
        <button type="submit" :disabled="loading"
          class="flex-1 sm:flex-none bg-emerald-500 text-white font-semibold py-3 px-8 rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
          <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ loading ? 'Saving...' : 'Save Entry' }}
        </button>
        <NuxtLink to="/dashboard"
          class="flex-1 sm:flex-none text-center text-gray-600 font-medium py-3 px-8 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
          Cancel
        </NuxtLink>
      </div>
    </form>
  </div>
</template>
