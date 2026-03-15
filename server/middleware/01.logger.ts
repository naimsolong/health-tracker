export default defineEventHandler((event) => {
  const start = Date.now()
  const { method, url } = event.node.req

  event.node.res.on('finish', () => {
    const duration = Date.now() - start
    const status = event.node.res.statusCode
    console.log(`[${new Date().toISOString()}] ${method} ${url} ${status} ${duration}ms`)
  })
})
