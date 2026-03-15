import { drizzle } from 'drizzle-orm/d1'
import * as schema from '../database/schema'

export function useDb(event: Parameters<typeof useRuntimeConfig>[0]) {
  const { cloudflare } = event.context as { cloudflare: { env: { DB: D1Database } } }
  return drizzle(cloudflare.env.DB, { schema })
}
