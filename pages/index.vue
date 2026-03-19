<script setup lang="ts">
definePageMeta({ middleware: 'guest' })
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
    <!-- Navigation -->
    <nav class="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span class="text-lg font-bold text-gray-900">HealthTracker</span>
          </div>
          <div class="flex items-center gap-3">
            <NuxtLink to="/login"
              class="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Sign in
            </NuxtLink>
            <NuxtLink to="/login"
              class="text-sm font-medium bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors">
              Get started free
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-32 pb-20 px-4">
      <div class="max-w-5xl mx-auto text-center">
        <div
          class="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium px-4 py-2 rounded-full mb-8">
          <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          Your personal health companion
        </div>
        <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
          Track your health,<br />
          <span class="text-emerald-500">live better</span>
        </h1>
        <p class="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Monitor weight, blood pressure, heart rate, sleep, steps, and more. Get insights that
          help you make healthier choices every day.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink to="/login"
            class="inline-flex items-center justify-center gap-2 bg-emerald-500 text-white font-semibold px-8 py-4 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 text-lg">
            Start tracking for free
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </NuxtLink>
          <NuxtLink to="/login"
            class="inline-flex items-center justify-center gap-2 bg-white text-gray-700 font-semibold px-8 py-4 rounded-xl hover:bg-gray-50 transition-all border border-gray-200 text-lg">
            Sign in
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Stats Banner -->
    <section class="py-12 bg-white border-y border-gray-100">
      <div class="max-w-5xl mx-auto px-4">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          <div>
            <div class="text-3xl font-bold text-gray-900">10+</div>
            <div class="text-sm text-gray-500 mt-1">Health metrics</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-gray-900">30-day</div>
            <div class="text-sm text-gray-500 mt-1">Trend analysis</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-gray-900">Free</div>
            <div class="text-sm text-gray-500 mt-1">No credit card</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-gray-900">Secure</div>
            <div class="text-sm text-gray-500 mt-1">Your data is private</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-24 px-4">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Everything you need to stay healthy</h2>
          <p class="text-lg text-gray-500 max-w-2xl mx-auto">
            A comprehensive health dashboard designed to keep you informed and motivated.
          </p>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard icon="weight" title="Weight Tracking"
            description="Log your weight daily and visualize trends to reach your target with confidence." />
          <FeatureCard icon="heart" title="Vital Signs"
            description="Track blood pressure, heart rate, and blood sugar levels in one place." />
          <FeatureCard icon="sleep" title="Sleep Analysis"
            description="Monitor sleep hours and understand how rest impacts your overall health." />
          <FeatureCard icon="steps" title="Activity Tracking"
            description="Count your daily steps and stay on top of your movement goals." />
          <FeatureCard icon="water" title="Hydration Log"
            description="Track water intake and ensure you stay properly hydrated every day." />
          <FeatureCard icon="mood" title="Mood Tracking"
            description="Record your daily mood to identify patterns and emotional wellbeing trends." />
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-24 px-4 bg-emerald-500">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-4xl font-bold text-white mb-4">Ready to take control of your health?</h2>
        <p class="text-emerald-100 text-lg mb-8">
          Join thousands of people who track their health metrics and live healthier lives.
        </p>
        <NuxtLink to="/login"
          class="inline-flex items-center gap-2 bg-white text-emerald-600 font-semibold px-8 py-4 rounded-xl hover:bg-emerald-50 transition-all text-lg">
          Get started — it's free
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </NuxtLink>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 px-4 bg-gray-900 text-gray-400">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span class="text-white font-semibold">HealthTracker</span>
        </div>
        <p class="text-sm">© 2025 HealthTracker. Built with Nuxt on Cloudflare Pages.</p>
      </div>
    </footer>
  </div>
</template>
