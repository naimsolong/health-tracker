<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

interface LabResult {
  id: number
  testDate: string
  testCategory: string
  testName: string
  value: number
  unit: string
  referenceLow: number | null
  referenceHigh: number | null
  labName: string | null
  orderedBy: string | null
  notes: string | null
}

// Lab test definitions (mirrors server schema)
const LAB_TESTS = {
  lipid_panel: {
    label: 'Lipid Panel',
    tests: [
      { name: 'cholesterol_total', label: 'Total Cholesterol', unit: 'mg/dL', low: 0, high: 200 },
      { name: 'ldl', label: 'LDL Cholesterol', unit: 'mg/dL', low: 0, high: 130 },
      { name: 'hdl', label: 'HDL Cholesterol', unit: 'mg/dL', low: 40, high: 999 },
      { name: 'triglycerides', label: 'Triglycerides', unit: 'mg/dL', low: 0, high: 150 },
    ],
  },
  metabolic: {
    label: 'Metabolic',
    tests: [
      { name: 'hba1c', label: 'HbA1c', unit: '%', low: 0, high: 5.7 },
      { name: 'glucose_fasting', label: 'Fasting Glucose', unit: 'mg/dL', low: 70, high: 99 },
      { name: 'creatinine', label: 'Creatinine', unit: 'mg/dL', low: 0.6, high: 1.2 },
      { name: 'egfr', label: 'eGFR', unit: 'mL/min/1.73m²', low: 60, high: 999 },
    ],
  },
  thyroid: {
    label: 'Thyroid',
    tests: [
      { name: 'tsh', label: 'TSH', unit: 'mIU/L', low: 0.4, high: 4.0 },
      { name: 't3_free', label: 'Free T3', unit: 'pg/mL', low: 2.3, high: 4.1 },
      { name: 't4_free', label: 'Free T4', unit: 'ng/dL', low: 0.8, high: 1.8 },
    ],
  },
  cbc: {
    label: 'Complete Blood Count',
    tests: [
      { name: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL', low: 12, high: 17.5 },
      { name: 'wbc', label: 'White Blood Cells', unit: '×10³/µL', low: 4.5, high: 11 },
      { name: 'platelets', label: 'Platelets', unit: '×10³/µL', low: 150, high: 400 },
      { name: 'hematocrit', label: 'Hematocrit', unit: '%', low: 36, high: 50 },
    ],
  },
  urinalysis: {
    label: 'Urinalysis',
    tests: [
      { name: 'urine_protein', label: 'Protein', unit: 'mg/dL', low: 0, high: 8 },
      { name: 'urine_glucose', label: 'Glucose', unit: 'mg/dL', low: 0, high: 15 },
      { name: 'urine_specific_gravity', label: 'Specific Gravity', unit: '', low: 1.005, high: 1.030 },
      { name: 'urine_ph', label: 'pH', unit: '', low: 4.5, high: 8.5 },
      { name: 'urine_blood', label: 'Blood (0–3 scale)', unit: '', low: 0, high: 0 },
      { name: 'urine_ketones', label: 'Ketones', unit: 'mg/dL', low: 0, high: 5 },
    ],
  },
}

const results = ref<LabResult[]>([])
const loading = ref(true)
const saving = ref(false)
const deleting = ref<number | null>(null)
const error = ref('')
const success = ref(false)
const activeTab = ref<'list' | 'add'>('list')

const form = reactive({
  testDate: new Date().toISOString().split('T')[0],
  testCategory: 'lipid_panel',
  testName: 'cholesterol_total',
  value: '',
  unit: 'mg/dL',
  referenceLow: '',
  referenceHigh: '',
  labName: '',
  orderedBy: '',
  notes: '',
})

const currentCategoryTests = computed(
  () => LAB_TESTS[form.testCategory as keyof typeof LAB_TESTS]?.tests ?? [],
)

function onCategoryChange() {
  const firstTest = currentCategoryTests.value[0]
  if (firstTest) {
    form.testName = firstTest.name
    form.unit = firstTest.unit
    form.referenceLow = firstTest.low != null ? String(firstTest.low) : ''
    form.referenceHigh = firstTest.high != null && firstTest.high !== 999 ? String(firstTest.high) : ''
  }
}

function onTestChange() {
  const test = currentCategoryTests.value.find((t) => t.name === form.testName)
  if (test) {
    form.unit = test.unit
    form.referenceLow = test.low != null ? String(test.low) : ''
    form.referenceHigh = test.high != null && test.high !== 999 ? String(test.high) : ''
  }
}

function getStatus(result: LabResult): 'normal' | 'low' | 'high' | 'unknown' {
  if (result.referenceLow == null || result.referenceHigh == null) return 'unknown'
  if (result.value < result.referenceLow) return 'low'
  if (result.value > result.referenceHigh) return 'high'
  return 'normal'
}

const statusStyles = {
  normal: 'bg-emerald-50 text-emerald-700',
  low: 'bg-blue-50 text-blue-700',
  high: 'bg-red-50 text-red-700',
  unknown: 'bg-gray-100 text-gray-600',
}

function getTestLabel(category: string, name: string) {
  const cat = LAB_TESTS[category as keyof typeof LAB_TESTS]
  return cat?.tests.find((t) => t.name === name)?.label ?? name
}

function getCategoryLabel(category: string) {
  return LAB_TESTS[category as keyof typeof LAB_TESTS]?.label ?? category
}

async function fetchResults() {
  const { data } = await useFetch('/api/labs')
  results.value = ((data.value as { results: LabResult[] })?.results) ?? []
  loading.value = false
}

async function handleSubmit() {
  error.value = ''
  success.value = false
  saving.value = true
  try {
    await $fetch('/api/labs', {
      method: 'POST',
      body: {
        testDate: form.testDate,
        testCategory: form.testCategory,
        testName: form.testName,
        value: Number(form.value),
        unit: form.unit,
        referenceLow: form.referenceLow ? Number(form.referenceLow) : null,
        referenceHigh: form.referenceHigh ? Number(form.referenceHigh) : null,
        labName: form.labName || null,
        orderedBy: form.orderedBy || null,
        notes: form.notes || null,
      },
    })
    success.value = true
    form.value = ''
    form.labName = ''
    form.orderedBy = ''
    form.notes = ''
    await fetchResults()
    activeTab.value = 'list'
  } catch (e: unknown) {
    error.value = (e as { data?: { message?: string } })?.data?.message || 'Failed to save'
  } finally {
    saving.value = false
  }
}

async function handleDelete(id: number) {
  if (!confirm('Delete this result?')) return
  deleting.value = id
  await $fetch(`/api/labs/${id}`, { method: 'DELETE' })
  results.value = results.value.filter((r) => r.id !== id)
  deleting.value = null
}

onMounted(fetchResults)
</script>

<template>
  <div class="p-6 lg:p-8 max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Lab Results</h1>
        <p class="text-gray-500 mt-1">Blood work, urinalysis, and other test results</p>
      </div>
      <button @click="activeTab = activeTab === 'add' ? 'list' : 'add'"
        class="flex items-center gap-2 bg-emerald-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-emerald-600 transition-colors">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            :d="activeTab === 'add' ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'" />
        </svg>
        {{ activeTab === 'add' ? 'Cancel' : 'Add Result' }}
      </button>
    </div>

    <!-- Add result form -->
    <div v-if="activeTab === 'add'" class="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
      <h2 class="font-semibold text-gray-900 mb-4">Add Lab Result</h2>

      <div v-if="success" class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-4 text-sm">Saved!</div>
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{{ error }}</div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Test Date</label>
            <input v-model="form.testDate" type="date" required
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select v-model="form.testCategory" @change="onCategoryChange"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
              <option v-for="(cat, key) in LAB_TESTS" :key="key" :value="key">{{ cat.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Test</label>
            <select v-model="form.testName" @change="onTestChange"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
              <option v-for="test in currentCategoryTests" :key="test.name" :value="test.name">{{ test.label }}</option>
            </select>
          </div>
        </div>

        <div class="grid sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Result Value
              <span v-if="form.unit" class="text-gray-400 font-normal">({{ form.unit }})</span>
            </label>
            <input v-model="form.value" type="number" step="any" required placeholder="Enter value"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Normal Range Low</label>
            <input v-model="form.referenceLow" type="number" step="any" placeholder="Lower bound"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Normal Range High</label>
            <input v-model="form.referenceHigh" type="number" step="any" placeholder="Upper bound"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>

        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Lab Name <span class="text-gray-400 font-normal">(optional)</span></label>
            <input v-model="form.labName" type="text" placeholder="e.g. Quest Diagnostics"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Ordered By <span class="text-gray-400 font-normal">(optional)</span></label>
            <input v-model="form.orderedBy" type="text" placeholder="Doctor's name"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>

        <button type="submit" :disabled="saving"
          class="bg-emerald-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center gap-2">
          <svg v-if="saving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ saving ? 'Saving...' : 'Save Result' }}
        </button>
      </form>
    </div>

    <!-- Results list -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="bg-white rounded-xl border border-gray-100 p-4 h-20 animate-pulse"></div>
    </div>

    <div v-else-if="results.length > 0" class="space-y-3">
      <div v-for="result in results" :key="result.id"
        class="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between gap-4 hover:shadow-sm transition-shadow">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-semibold text-gray-900">{{ getTestLabel(result.testCategory, result.testName) }}</span>
            <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{{ getCategoryLabel(result.testCategory) }}</span>
            <span :class="['text-xs font-medium px-2 py-0.5 rounded-full', statusStyles[getStatus(result)]]">
              {{ getStatus(result) === 'unknown' ? '—' : getStatus(result).toUpperCase() }}
            </span>
          </div>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="text-2xl font-bold text-gray-900">{{ result.value }}</span>
            <span class="text-sm text-gray-500">{{ result.unit }}</span>
            <span v-if="result.referenceLow != null && result.referenceHigh != null" class="text-xs text-gray-400">
              (ref: {{ result.referenceLow }}–{{ result.referenceHigh }})
            </span>
          </div>
          <div class="flex gap-3 mt-1 text-xs text-gray-400">
            <span>{{ result.testDate }}</span>
            <span v-if="result.labName">{{ result.labName }}</span>
            <span v-if="result.orderedBy">Dr. {{ result.orderedBy }}</span>
          </div>
        </div>
        <button @click="handleDelete(result.id)" :disabled="deleting === result.id"
          class="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 flex-shrink-0">
          <svg v-if="deleting === result.id" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
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
      <div class="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">No lab results yet</h3>
      <p class="text-gray-500 mb-6">Add your blood work and test results to track trends over time.</p>
      <button @click="activeTab = 'add'"
        class="inline-flex items-center gap-2 bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-emerald-600 transition-colors">
        Add first result
      </button>
    </div>
  </div>
</template>
