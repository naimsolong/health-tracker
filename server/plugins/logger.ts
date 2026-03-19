export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('request', (event) => {
    console.log(`[request] ${event.method} ${event.path}`)
  })
  nitro.hooks.hook('afterResponse', (event, { body }) => {
    console.log(`[response] ${event.method} ${event.path} → ${event.node.res.statusCode}`)
  })
})
