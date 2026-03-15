<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

interface Symptom {
  id: number
  date: string
  loggedAt: string
  symptom: string
  severity: number | null
  durationMin: number | null
  notes: string | null
}

const COMMON_SYMPTOMS = [
  'Headache', 'Fatigue', 'Fever', 'Cough', 'Shortness of breath',
  'Chest pain', 'Nausea', 'Vomiting', 'Diarrhea', 'Abdominal pain',
  'Back pain', 'Joint pain', 'Muscle aches', 'Dizziness', 'Insomnia',
  'Anxiety', 'Swelling', 'Rash', 'Sore throat', 'Runny nose',
]

const symptoms = ref<Symptom[]>([])
const loading = ref(true)
const saving = ref(false)
const deleting = ref<number | null>(null)
const showForm = ref(false)
const error = ref('')

const form = reactive({
  symptom: '',
  customSymptom: '',
  severity: 5,
  durationMin: '',
  date: new Date().toISOString().split('T')[0],
  notes: '',
})

const useCustomSymptom = ref(false)

const symptomToLog = computed(() => useCustomSymptom.value ? form.customSymptom : form.symptom)

const severityLabel = computed(() => {
  if (form.severity <= 2) return 'Very Mild'
  if (form.severity <= 4) return 'Mild'
  if (form.severity <= 6) return 'Moderate'
  if (form.severity <= 8) return 'Severe'
  return 'Very Severe'
})

const severityColor = computed(() => {
  if (form.severity <= 3) return 'text-emerald-600'
  if (form.severity <= 6) return 'text-amber-600'
  return 'text-red-600'
})

async function fetchSymptoms() {
  const { data } = await useFetch('/api/symptoms')
  symptoms.value = ((data.value as { symptoms: Symptom[] })?.symptoms) ?? []
  loading.value = false
}

async function handleSubmit() {
  const name = symptomToLog.value.trim()
  if (!name) { error.value = 'Please select or enter a symptom'; return }
  error.value = ''
  saving.value = true
  try {
    await $fetch('/api/symptoms', {
      method: 'POST',
      body: {
        symptom: name,
        severity: form.severity,
        durationMin: form.durationMin ? Number(form.durationMin) : null,
        date: form.date,
        notes: form.notes || null,
      },
    })
    form.symptom = ''
    form.customSymptom = ''
    form.durationMin = ''
    form.notes = ''
    form.severity = 5
    showForm.value = false
    await fetchSymptoms()
  } catch (e: unknown) {
    error.value = (e as { data?: { message?: string } })?.data?.message || 'Failed to save'
  } finally {
    saving.value = false
  }
}

async function handleDelete(id: number) {
  if (!confirm('Delete this symptom?')) return
  deleting.value = id
  await $fetch(`/api/symptoms/${id}`, { method: 'DELETE' })
  symptoms.value = symptoms.value.filter((s) => s.id !== id)
  deleting.value = null
}

function formatDuration(min: number | null) {
  if (!min) return null
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

onMounted(fetchSymptoms)
</script>

<template>
  <div class="p-6 lg:p-8 max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Symptoms Log</h1>
        <p class="text-gray-500 mt-1">Track symptoms to identify patterns and share with your doctor</p>
      </div>
      <button @click="showForm = !showForm"
        class="flex items-center gap-2 bg-emerald-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-emerald-600 transition-colors">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            :d="showForm ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'" />
        </svg>
        {{ showForm ? 'Cancel' : 'Log Symptom' }}
      </button>
    </div>

    <!-- Log form -->
    <div v-if="showForm" class="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
      <h2 class="font-semibold text-gray-900 mb-4">Log a Symptom</h2>
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{{ error }}</div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Symptom</label>
          <div v-if="!useCustomSymptom">
            <div class="flex flex-wrap gap-2 mb-2">
              <button v-for="s in COMMON_SYMPTOMS" :key="s" type="button"
                @click="form.symptom = s"
                :class="['text-sm px-3 py-1.5 rounded-full border transition-colors', form.symptom === s ? 'bg-emerald-500 text-white border-emerald-500' : 'border-gray-200 text-gray-600 hover:border-emerald-300']">
                {{ s }}
              </button>
            </div>
            <button type="button" @click="useCustomSymptom = true" class="text-sm text-emerald-600 hover:text-emerald-700">
              + Enter custom symptom
            </button>
          </div>
          <div v-else class="flex gap-2">
            <input v-model="form.customSymptom" type="text" placeholder="Describe your symptom" autofocus
              class="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <button type="button" @click="useCustomSymptom = false; form.customSymptom = ''"
              class="px-3 py-2 text-gray-400 hover:text-gray-600">← Back</button>
          </div>
        </div>

        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Severity
              <span :class="['font-semibold ml-1', severityColor]">{{ form.severity }}/10 — {{ severityLabel }}</span>
            </label>
            <input v-model="form.severity" type="range" min="1" max="10" step="1"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
            <div class="flex justify-between text-xs text-gray-400 mt-1">
              <span>1 (Very mild)</span><span>10 (Very severe)</span>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
            <input v-model="form.durationMin" type="number" min="1" placeholder="e.g. 60 for 1 hour"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input v-model="form.date" type="date"
            class="w-full sm:w-auto px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Notes <span class="text-gray-400 font-normal">(optional)</span></label>
          <textarea v-model="form.notes" rows="2" placeholder="Any additional context..."
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"></textarea>
        </div>

        <button type="submit" :disabled="saving"
          class="bg-emerald-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center gap-2">
          <svg v-if="saving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ saving ? 'Saving...' : 'Log Symptom' }}
        </button>
      </form>
    </div>

    <!-- Symptoms list -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="bg-white rounded-xl border border-gray-100 p-4 h-16 animate-pulse"></div>
    </div>

    <div v-else-if="symptoms.length > 0" class="space-y-3">
      <div v-for="s in symptoms" :key="s.id"
        class="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-4 hover:shadow-sm transition-shadow">
        <div class="flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-medium text-gray-900">{{ s.symptom }}</span>
            <span v-if="s.severity"
              :class="['text-xs font-medium px-2 py-0.5 rounded-full', s.severity <= 3 ? 'bg-emerald-50 text-emerald-700' : s.severity <= 6 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700']">
              Severity {{ s.severity }}/10
            </span>
            <span v-if="s.durationMin" class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {{ formatDuration(s.durationMin) }}
            </span>
          </div>
          <p class="text-sm text-gray-400 mt-0.5">{{ s.date }} · {{ s.loggedAt.split(' ')[1]?.slice(0, 5) }}</p>
          <p v-if="s.notes" class="text-sm text-gray-500 mt-1 italic">{{ s.notes }}</p>
        </div>
        <button @click="handleDelete(s.id)" :disabled="deleting === s.id"
          class="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 flex-shrink-0">
          <svg v-if="deleting === s.id" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <div v-else class="bg-white rounded-2xl border border-gray-100 p-12 text-center">
      <div class="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">No symptoms logged</h3>
      <p class="text-gray-500 mb-6">Log symptoms as they occur to identify patterns and share with your doctor.</p>
      <button @click="showForm = true"
        class="inline-flex items-center gap-2 bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-emerald-600 transition-colors">
        Log first symptom
      </button>
    </div>
  </div>
</template>
