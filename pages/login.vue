<script setup lang="ts">
definePageMeta({ middleware: 'guest' })

const { login } = useAuth()
const route = useRoute()

const form = reactive({ email: '', password: '' })
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await login(form.email, form.password)
    const redirect = (route.query.redirect as string) || '/dashboard'
    await navigateTo(redirect)
  } catch (e: unknown) {
    error.value = (e as { data?: { message?: string } })?.data?.message || 'Invalid credentials'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center gap-2 mb-6">
          <div class="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span class="text-xl font-bold text-gray-900">HealthTracker</span>
        </NuxtLink>
        <h1 class="text-3xl font-bold text-gray-900">Welcome back</h1>
        <p class="text-gray-500 mt-2">Sign in to continue tracking your health</p>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div v-if="error"
            class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {{ error }}
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email address</label>
            <input v-model="form.email" type="email" required autocomplete="email"
              placeholder="you@example.com"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input v-model="form.password" type="password" required autocomplete="current-password"
              placeholder="••••••••"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" />
          </div>

          <button type="submit" :disabled="loading"
            class="w-full bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
            <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
          Don't have an account?
          <NuxtLink to="/register" class="text-emerald-600 font-medium hover:text-emerald-700">
            Create one free
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>
