<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { user } = useAuth()
const subscriptionStatus = computed(() => (user.value as { subscriptionStatus?: string } | null)?.subscriptionStatus ?? 'free')
const isPro = computed(() => subscriptionStatus.value === 'active')

const loading = ref(false)
const error = ref('')

async function upgrade() {
  loading.value = true
  error.value = ''
  try {
    const { data, error: fetchError } = await useFetch('/api/billing/create-checkout', { method: 'POST' })
    if (fetchError.value) throw fetchError.value
    const url = (data.value as { url: string }).url
    window.location.href = url
  } catch (e: unknown) {
    error.value = (e as { data?: { message?: string }; message?: string })?.data?.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
}

async function manageSubscription() {
  loading.value = true
  error.value = ''
  try {
    const { data, error: fetchError } = await useFetch('/api/billing/portal', { method: 'POST' })
    if (fetchError.value) throw fetchError.value
    const url = (data.value as { url: string }).url
    window.location.href = url
  } catch (e: unknown) {
    error.value = (e as { data?: { message?: string }; message?: string })?.data?.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 mb-1">Billing</h1>
    <p class="text-gray-500 mb-8">Manage your subscription and plan.</p>

    <!-- Current plan banner -->
    <div class="rounded-xl border p-5 mb-8 flex items-center gap-4"
      :class="isPro ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'">
      <div class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
        :class="isPro ? 'bg-emerald-100' : 'bg-gray-200'">
        <svg class="w-6 h-6" :class="isPro ? 'text-emerald-600' : 'text-gray-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      </div>
      <div class="flex-1">
        <p class="font-semibold text-gray-900">
          Current plan:
          <span :class="isPro ? 'text-emerald-700' : 'text-gray-600'">
            {{ isPro ? 'Pro' : 'Free' }}
          </span>
        </p>
        <p class="text-sm text-gray-500 mt-0.5">
          <template v-if="isPro">File uploads enabled. Manage or cancel below.</template>
          <template v-else-if="subscriptionStatus === 'past_due'">Payment failed — please update your payment method.</template>
          <template v-else-if="subscriptionStatus === 'canceled'">Your subscription was canceled.</template>
          <template v-else>Upgrade to Pro to attach files to your health records.</template>
        </p>
      </div>
      <div v-if="isPro" class="text-emerald-700 font-semibold text-sm">$3 / month</div>
    </div>

    <!-- Error -->
    <div v-if="error" class="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{{ error }}</div>

    <!-- Plan comparison -->
    <div class="grid sm:grid-cols-2 gap-4 mb-8">
      <!-- Free -->
      <div class="rounded-xl border border-gray-200 p-6">
        <p class="text-lg font-bold text-gray-900 mb-1">Free</p>
        <p class="text-3xl font-bold text-gray-900 mb-4">$0 <span class="text-base font-normal text-gray-400">/ month</span></p>
        <ul class="space-y-2 text-sm text-gray-600">
          <li class="flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Daily health logging
          </li>
          <li class="flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Lab results tracking
          </li>
          <li class="flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Symptoms &amp; vaccinations
          </li>
          <li class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            <span class="text-gray-400">File attachments</span>
          </li>
        </ul>
      </div>

      <!-- Pro -->
      <div class="rounded-xl border-2 border-emerald-500 p-6 relative">
        <span class="absolute -top-3 left-4 bg-emerald-500 text-white text-xs font-semibold px-3 py-0.5 rounded-full">Most popular</span>
        <p class="text-lg font-bold text-gray-900 mb-1">Pro</p>
        <p class="text-3xl font-bold text-gray-900 mb-4">$3 <span class="text-base font-normal text-gray-400">/ month</span></p>
        <ul class="space-y-2 text-sm text-gray-600">
          <li class="flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Everything in Free
          </li>
          <li class="flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Upload lab PDFs &amp; images
          </li>
          <li class="flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Attach files to health records
          </li>
          <li class="flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Up to 10 MB per file
          </li>
        </ul>
      </div>
    </div>

    <!-- CTA -->
    <div class="flex gap-3">
      <button v-if="!isPro" @click="upgrade" :disabled="loading"
        class="px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
        {{ loading ? 'Redirecting...' : 'Upgrade to Pro — $3/month' }}
      </button>
      <button v-if="isPro || subscriptionStatus === 'past_due' || subscriptionStatus === 'canceled'" @click="manageSubscription" :disabled="loading"
        class="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
        {{ loading ? 'Loading...' : 'Manage subscription' }}
      </button>
    </div>
  </div>
</template>
