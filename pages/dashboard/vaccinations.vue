<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

interface Vaccination {
  id: number
  vaccineName: string
  dateGiven: string
  doseNumber: number | null
  manufacturer: string | null
  lotNumber: string | null
  administeredBy: string | null
  nextDueDate: string | null
  notes: string | null
}

const COMMON_VACCINES = [
  'Influenza (Flu)', 'COVID-19', 'COVID-19 Booster',
  'Tdap (Tetanus, Diphtheria, Pertussis)', 'Hepatitis A', 'Hepatitis B',
  'MMR (Measles, Mumps, Rubella)', 'Varicella (Chickenpox)',
  'Pneumococcal (PPSV23)', 'Shingrix (Shingles)', 'HPV', 'Meningococcal',
  'Typhoid', 'Yellow Fever', 'Rabies',
]

const records = ref<Vaccination[]>([])
const loading = ref(true)
const saving = ref(false)
const deleting = ref<number | null>(null)
const showForm = ref(false)
const error = ref('')

const form = reactive({
  vaccineName: '',
  customVaccine: '',
  dateGiven: new Date().toISOString().split('T')[0],
  doseNumber: '',
  manufacturer: '',
  lotNumber: '',
  administeredBy: '',
  nextDueDate: '',
  notes: '',
})

const useCustomVaccine = ref(false)
const vaccineName = computed(() => useCustomVaccine.value ? form.customVaccine : form.vaccineName)

function daysUntilDue(date: string | null) {
  if (!date) return null
  const diff = new Date(date).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

async function fetchVaccinations() {
  const { data } = await useFetch('/api/vaccinations')
  records.value = ((data.value as { vaccinations: Vaccination[] })?.vaccinations) ?? []
  loading.value = false
}

async function handleSubmit() {
  const name = vaccineName.value.trim()
  if (!name || !form.dateGiven) { error.value = 'Vaccine name and date are required'; return }
  error.value = ''
  saving.value = true
  try {
    await $fetch('/api/vaccinations', {
      method: 'POST',
      body: {
        vaccineName: name,
        dateGiven: form.dateGiven,
        doseNumber: form.doseNumber ? Number(form.doseNumber) : null,
        manufacturer: form.manufacturer || null,
        lotNumber: form.lotNumber || null,
        administeredBy: form.administeredBy || null,
        nextDueDate: form.nextDueDate || null,
        notes: form.notes || null,
      },
    })
    Object.assign(form, {
      vaccineName: '', customVaccine: '', doseNumber: '', manufacturer: '',
      lotNumber: '', administeredBy: '', nextDueDate: '', notes: '',
    })
    useCustomVaccine.value = false
    showForm.value = false
    await fetchVaccinations()
  } catch (e: unknown) {
    error.value = (e as { data?: { message?: string } })?.data?.message || 'Failed to save'
  } finally {
    saving.value = false
  }
}

async function handleDelete(id: number) {
  if (!confirm('Delete this vaccination record?')) return
  deleting.value = id
  await $fetch(`/api/vaccinations/${id}`, { method: 'DELETE' })
  records.value = records.value.filter((r) => r.id !== id)
  deleting.value = null
}

onMounted(fetchVaccinations)
</script>

<template>
  <div class="p-6 lg:p-8 max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Vaccinations</h1>
        <p class="text-gray-500 mt-1">Immunization history and upcoming boosters</p>
      </div>
      <button @click="showForm = !showForm"
        class="flex items-center gap-2 bg-emerald-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-emerald-600 transition-colors">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            :d="showForm ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'" />
        </svg>
        {{ showForm ? 'Cancel' : 'Add Vaccine' }}
      </button>
    </div>

    <!-- Upcoming boosters alert -->
    <div v-if="records.some(r => r.nextDueDate && daysUntilDue(r.nextDueDate)! <= 30 && daysUntilDue(r.nextDueDate)! >= 0)"
      class="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
      <p class="text-sm font-semibold text-amber-800 mb-2">Upcoming boosters</p>
      <div v-for="r in records.filter(r => r.nextDueDate && daysUntilDue(r.nextDueDate)! <= 30 && daysUntilDue(r.nextDueDate)! >= 0)"
        :key="r.id" class="text-sm text-amber-700">
        {{ r.vaccineName }} due {{ r.nextDueDate }}
        ({{ daysUntilDue(r.nextDueDate) === 0 ? 'today' : `in ${daysUntilDue(r.nextDueDate)} days` }})
      </div>
    </div>

    <!-- Add form -->
    <div v-if="showForm" class="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
      <h2 class="font-semibold text-gray-900 mb-4">Add Vaccination Record</h2>
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{{ error }}</div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Vaccine</label>
          <div v-if="!useCustomVaccine">
            <select v-model="form.vaccineName"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white mb-2">
              <option value="">Select a vaccine</option>
              <option v-for="v in COMMON_VACCINES" :key="v" :value="v">{{ v }}</option>
            </select>
            <button type="button" @click="useCustomVaccine = true" class="text-sm text-emerald-600 hover:text-emerald-700">
              + Enter custom vaccine
            </button>
          </div>
          <div v-else class="flex gap-2">
            <input v-model="form.customVaccine" type="text" placeholder="Vaccine name" autofocus
              class="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <button type="button" @click="useCustomVaccine = false; form.customVaccine = ''"
              class="px-3 py-2 text-gray-400 hover:text-gray-600">← Back</button>
          </div>
        </div>

        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date Given</label>
            <input v-model="form.dateGiven" type="date" required
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Dose # <span class="text-gray-400 font-normal">(optional)</span></label>
            <input v-model="form.doseNumber" type="number" min="1" placeholder="e.g. 1, 2, 3"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Manufacturer <span class="text-gray-400 font-normal">(optional)</span></label>
            <input v-model="form.manufacturer" type="text" placeholder="e.g. Pfizer, Moderna"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Lot Number <span class="text-gray-400 font-normal">(optional)</span></label>
            <input v-model="form.lotNumber" type="text" placeholder="From vaccine card"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Administered By <span class="text-gray-400 font-normal">(optional)</span></label>
            <input v-model="form.administeredBy" type="text" placeholder="Clinic or provider"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Next Due Date <span class="text-gray-400 font-normal">(optional)</span></label>
            <input v-model="form.nextDueDate" type="date"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>

        <button type="submit" :disabled="saving"
          class="bg-emerald-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center gap-2">
          <svg v-if="saving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ saving ? 'Saving...' : 'Save Record' }}
        </button>
      </form>
    </div>

    <!-- Records list -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="bg-white rounded-xl border border-gray-100 p-5 h-20 animate-pulse"></div>
    </div>

    <div v-else-if="records.length > 0" class="space-y-3">
      <div v-for="record in records" :key="record.id"
        class="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <span class="font-semibold text-gray-900">{{ record.vaccineName }}</span>
              <span v-if="record.doseNumber" class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                Dose {{ record.doseNumber }}
              </span>
              <span v-if="record.nextDueDate && daysUntilDue(record.nextDueDate)! <= 30 && daysUntilDue(record.nextDueDate)! >= 0"
                class="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                Due soon
              </span>
              <span v-if="record.nextDueDate && daysUntilDue(record.nextDueDate)! < 0"
                class="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                Overdue
              </span>
            </div>
            <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
              <span>Given: {{ record.dateGiven }}</span>
              <span v-if="record.nextDueDate">Next due: {{ record.nextDueDate }}</span>
              <span v-if="record.manufacturer">{{ record.manufacturer }}</span>
              <span v-if="record.administeredBy">{{ record.administeredBy }}</span>
            </div>
          </div>
          <button @click="handleDelete(record.id)" :disabled="deleting === record.id"
            class="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 flex-shrink-0">
            <svg v-if="deleting === record.id" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
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
    </div>

    <div v-else class="bg-white rounded-2xl border border-gray-100 p-12 text-center">
      <div class="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">No vaccinations recorded</h3>
      <p class="text-gray-500 mb-6">Keep track of your immunization history and upcoming boosters.</p>
      <button @click="showForm = true"
        class="inline-flex items-center gap-2 bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-emerald-600 transition-colors">
        Add first record
      </button>
    </div>
  </div>
</template>
