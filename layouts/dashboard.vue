<script setup lang="ts">
const { user, logout, fetchUser } = useAuth()

onMounted(async () => {
  await fetchUser()
})

const navItems = [
  { path: '/dashboard', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/dashboard/log', label: 'Log Entry', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { path: '/dashboard/history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { path: '/dashboard/goals', label: 'Goals', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
]

const mobileMenuOpen = ref(false)
const route = useRoute()
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar (desktop) -->
    <aside class="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-100 fixed inset-y-0">
      <div class="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
        <div class="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <span class="text-lg font-bold text-gray-900">HealthTracker</span>
      </div>

      <nav class="flex-1 px-3 py-4 space-y-1">
        <NuxtLink v-for="item in navItems" :key="item.path" :to="item.path"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          :class="route.path === item.path
            ? 'bg-emerald-50 text-emerald-700'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
          </svg>
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-gray-100">
        <div class="flex items-center gap-3 px-3 py-2 mb-2">
          <div class="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-semibold text-sm">
            {{ user?.name?.charAt(0)?.toUpperCase() || 'U' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ user?.name }}</p>
            <p class="text-xs text-gray-500 truncate">{{ user?.email }}</p>
          </div>
        </div>
        <button @click="logout"
          class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>

    <!-- Mobile header -->
    <div class="lg:hidden fixed top-0 inset-x-0 z-50 bg-white border-b border-gray-100">
      <div class="flex items-center justify-between px-4 h-16">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span class="font-bold text-gray-900">HealthTracker</span>
        </div>
        <button @click="mobileMenuOpen = !mobileMenuOpen" class="p-2 rounded-lg hover:bg-gray-100">
          <svg class="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              :d="mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'" />
          </svg>
        </button>
      </div>
      <!-- Mobile nav dropdown -->
      <div v-if="mobileMenuOpen" class="border-t border-gray-100 bg-white px-3 py-2 space-y-1">
        <NuxtLink v-for="item in navItems" :key="item.path" :to="item.path"
          @click="mobileMenuOpen = false"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium"
          :class="route.path === item.path ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600'">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
          </svg>
          {{ item.label }}
        </NuxtLink>
        <button @click="logout"
          class="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 rounded-lg">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </div>

    <!-- Main content -->
    <main class="flex-1 lg:ml-64 pt-16 lg:pt-0">
      <slot />
    </main>
  </div>
</template>
