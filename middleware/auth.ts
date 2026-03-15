export default defineNuxtRouteMiddleware(async (to) => {
  const { data, error } = await useFetch('/api/auth/me')

  if (error.value || !data.value?.user) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
