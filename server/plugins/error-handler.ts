export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('error', (error, { event }) => {
    const method = event?.method ?? 'UNKNOWN'
    const url = event?.path ?? 'UNKNOWN'
    console.error(`[server error] ${method} ${url} →`, error)
  })
})
