<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const loading = ref(true)
const saving = ref(false)
const success = ref(false)
const error = ref('')

const form = reactive({
  height: '',
  bloodType: '',
  dateOfBirth: '',
  biologicalSex: '',
  smokingStatus: '',
  alcoholUse: '',
  allergies: [] as string[],
  chronicConditions: [] as string[],
  currentMedications: [] as string[],
  familyHistory: [] as string[],
  notes: '',
})

// Temp inputs for tag-style multi-value fields
const inputs = reactive({
  allergy: '',
  condition: '',
  medication: '',
  familyHistory: '',
})

function addTag(field: 'allergies' | 'chronicConditions' | 'currentMedications' | 'familyHistory', inputKey: keyof typeof inputs) {
  const val = inputs[inputKey].trim()
  if (val && !form[field].includes(val)) {
    form[field].push(val)
  }
  inputs[inputKey] = ''
}

function removeTag(field: 'allergies' | 'chronicConditions' | 'currentMedications' | 'familyHistory', val: string) {
  form[field] = form[field].filter((v) => v !== val)
}

onMounted(async () => {
  const { data } = await useFetch('/api/medical-profile')
  const profile = (data.value as { profile: Record<string, unknown> | null })?.profile
  if (profile) {
    form.height = String(profile.height ?? '')
    form.bloodType = String(profile.bloodType ?? '')
    form.dateOfBirth = String(profile.dateOfBirth ?? '')
    form.biologicalSex = String(profile.biologicalSex ?? '')
    form.smokingStatus = String(profile.smokingStatus ?? '')
    form.alcoholUse = String(profile.alcoholUse ?? '')
    form.allergies = (profile.allergies as string[]) ?? []
    form.chronicConditions = (profile.chronicConditions as string[]) ?? []
    form.currentMedications = (profile.currentMedications as string[]) ?? []
    form.familyHistory = (profile.familyHistory as string[]) ?? []
    form.notes = String(profile.notes ?? '')
  }
  loading.value = false
})

async function handleSubmit() {
  error.value = ''
  success.value = false
  saving.value = true
  try {
    await $fetch('/api/medical-profile', {
      method: 'POST',
      body: {
        height: form.height ? Number(form.height) : null,
        bloodType: form.bloodType || null,
        dateOfBirth: form.dateOfBirth || null,
        biologicalSex: form.biologicalSex || null,
        smokingStatus: form.smokingStatus || null,
        alcoholUse: form.alcoholUse || null,
        allergies: form.allergies,
        chronicConditions: form.chronicConditions,
        currentMedications: form.currentMedications,
        familyHistory: form.familyHistory,
        notes: form.notes || null,
      },
    })
    success.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e: unknown) {
    error.value = (e as { data?: { message?: string } })?.data?.message || 'Failed to save'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="p-6 lg:p-8 max-w-3xl mx-auto">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Medical Profile</h1>
      <p class="text-gray-500 mt-1">Your static health information. This is shown to doctors and used for risk calculations.</p>
    </div>

    <div v-if="success" class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-4 rounded-xl mb-6 flex items-center gap-3">
      <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Medical profile saved successfully.
    </div>
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6">{{ error }}</div>

    <div v-if="loading" class="space-y-4">
      <div v-for="i in 4" :key="i" class="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-40 mb-4"></div>
        <div class="grid sm:grid-cols-2 gap-4">
          <div class="h-12 bg-gray-100 rounded-xl"></div>
          <div class="h-12 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Physical Baseline -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 class="font-semibold text-gray-900 mb-4">Physical Baseline</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
            <input v-model="form.height" type="number" step="0.1" min="50" max="300" placeholder="170"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
            <select v-model="form.bloodType"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
              <option value="">Unknown</option>
              <option v-for="t in ['A+','A-','B+','B-','AB+','AB-','O+','O-']" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
            <input v-model="form.dateOfBirth" type="date"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Biological Sex</label>
            <select v-model="form.biologicalSex"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Lifestyle -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 class="font-semibold text-gray-900 mb-4">Lifestyle</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Smoking Status</label>
            <select v-model="form.smokingStatus"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
              <option value="">Not specified</option>
              <option value="never">Never smoked</option>
              <option value="former">Former smoker</option>
              <option value="current">Current smoker</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Alcohol Use</label>
            <select v-model="form.alcoholUse"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
              <option value="">Not specified</option>
              <option value="none">None</option>
              <option value="occasional">Occasional</option>
              <option value="moderate">Moderate</option>
              <option value="heavy">Heavy</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Allergies -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 class="font-semibold text-gray-900 mb-1">Allergies</h2>
        <p class="text-sm text-gray-500 mb-4">Medications, foods, environmental triggers</p>
        <div class="flex gap-2 mb-3">
          <input v-model="inputs.allergy" type="text" placeholder="e.g. Penicillin, Peanuts"
            class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            @keydown.enter.prevent="addTag('allergies', 'allergy')" />
          <button type="button" @click="addTag('allergies', 'allergy')"
            class="px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition-colors">Add</button>
        </div>
        <div class="flex flex-wrap gap-2">
          <span v-for="tag in form.allergies" :key="tag"
            class="inline-flex items-center gap-1.5 bg-red-50 text-red-700 text-sm px-3 py-1 rounded-full">
            {{ tag }}
            <button type="button" @click="removeTag('allergies', tag)" class="text-red-400 hover:text-red-600">×</button>
          </span>
          <span v-if="form.allergies.length === 0" class="text-sm text-gray-400">No allergies added</span>
        </div>
      </div>

      <!-- Chronic Conditions -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 class="font-semibold text-gray-900 mb-1">Chronic Conditions</h2>
        <p class="text-sm text-gray-500 mb-4">Ongoing diagnosed medical conditions</p>
        <div class="flex gap-2 mb-3">
          <input v-model="inputs.condition" type="text" placeholder="e.g. Type 2 Diabetes, Hypertension"
            class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            @keydown.enter.prevent="addTag('chronicConditions', 'condition')" />
          <button type="button" @click="addTag('chronicConditions', 'condition')"
            class="px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition-colors">Add</button>
        </div>
        <div class="flex flex-wrap gap-2">
          <span v-for="tag in form.chronicConditions" :key="tag"
            class="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 text-sm px-3 py-1 rounded-full">
            {{ tag }}
            <button type="button" @click="removeTag('chronicConditions', tag)" class="text-orange-400 hover:text-orange-600">×</button>
          </span>
          <span v-if="form.chronicConditions.length === 0" class="text-sm text-gray-400">No conditions added</span>
        </div>
      </div>

      <!-- Medications -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 class="font-semibold text-gray-900 mb-1">Current Medications</h2>
        <p class="text-sm text-gray-500 mb-4">Include name and dosage if known</p>
        <div class="flex gap-2 mb-3">
          <input v-model="inputs.medication" type="text" placeholder="e.g. Metformin 500mg, Lisinopril 10mg"
            class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            @keydown.enter.prevent="addTag('currentMedications', 'medication')" />
          <button type="button" @click="addTag('currentMedications', 'medication')"
            class="px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition-colors">Add</button>
        </div>
        <div class="flex flex-wrap gap-2">
          <span v-for="tag in form.currentMedications" :key="tag"
            class="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full">
            {{ tag }}
            <button type="button" @click="removeTag('currentMedications', tag)" class="text-blue-400 hover:text-blue-600">×</button>
          </span>
          <span v-if="form.currentMedications.length === 0" class="text-sm text-gray-400">No medications added</span>
        </div>
      </div>

      <!-- Family History -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 class="font-semibold text-gray-900 mb-1">Family History</h2>
        <p class="text-sm text-gray-500 mb-4">Conditions in immediate family members</p>
        <div class="flex gap-2 mb-3">
          <input v-model="inputs.familyHistory" type="text" placeholder="e.g. Heart disease, Diabetes"
            class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            @keydown.enter.prevent="addTag('familyHistory', 'familyHistory')" />
          <button type="button" @click="addTag('familyHistory', 'familyHistory')"
            class="px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition-colors">Add</button>
        </div>
        <div class="flex flex-wrap gap-2">
          <span v-for="tag in form.familyHistory" :key="tag"
            class="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 text-sm px-3 py-1 rounded-full">
            {{ tag }}
            <button type="button" @click="removeTag('familyHistory', tag)" class="text-purple-400 hover:text-purple-600">×</button>
          </span>
          <span v-if="form.familyHistory.length === 0" class="text-sm text-gray-400">No history added</span>
        </div>
      </div>

      <!-- Notes -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 class="font-semibold text-gray-900 mb-4">Additional Notes</h2>
        <textarea v-model="form.notes" rows="3" placeholder="Any other relevant medical information..."
          class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"></textarea>
      </div>

      <button type="submit" :disabled="saving"
        class="w-full sm:w-auto bg-emerald-500 text-white font-semibold py-3 px-8 rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center gap-2">
        <svg v-if="saving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {{ saving ? 'Saving...' : 'Save Medical Profile' }}
      </button>
    </form>
  </div>
</template>
