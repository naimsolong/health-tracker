export default defineEventHandler((event) => {
  const start = Date.now()
  const { method, url } = event.node.req

  // Log only the pathname — never query strings (may contain tokens or sensitive params)
  const pathname = url ? url.split('?')[0] : '/'

  event.node.res.on('finish', () => {
    const duration = Date.now() - start
    const status = event.node.res.statusCode
    console.log(`[${new Date().toISOString()}] ${method} ${pathname} ${status} ${duration}ms`)
  })
})
