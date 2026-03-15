export function useAuth() {
  const user = useState<{ id: number; name: string; email: string } | null>('auth-user', () => null)

  async function fetchUser() {
    const { data, error } = await useFetch('/api/auth/me')
    if (!error.value && data.value?.user) {
      user.value = data.value.user as typeof user.value
    } else {
      user.value = null
    }
    return user.value
  }

  async function login(email: string, password: string) {
    const { data, error } = await useFetch('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    if (error.value) throw error.value
    user.value = (data.value as { user: typeof user.value }).user
    return user.value
  }

  async function register(name: string, email: string, password: string) {
    const { data, error } = await useFetch('/api/auth/register', {
      method: 'POST',
      body: { name, email, password },
    })
    if (error.value) throw error.value
    user.value = (data.value as { user: typeof user.value }).user
    return user.value
  }

  async function logout() {
    await useFetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/')
  }

  const isAuthenticated = computed(() => !!user.value)

  return { user, fetchUser, login, register, logout, isAuthenticated }
}
