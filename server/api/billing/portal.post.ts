import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const authUser = requireAuth(event)
  const config = useRuntimeConfig(event)
  const db = useDb(event)

  const user = await db
    .select({ stripeCustomerId: users.stripeCustomerId })
    .from(users)
    .where(eq(users.id, authUser.id))
    .get()

  if (!user?.stripeCustomerId) {
    throw createError({ statusCode: 400, message: 'No active subscription found' })
  }

  const host = getRequestHeader(event, 'host') || 'localhost:3000'
  const proto = host.includes('localhost') ? 'http' : 'https'
  const baseUrl = `${proto}://${host}`

  const params = new URLSearchParams({
    customer: user.stripeCustomerId,
    return_url: `${baseUrl}/dashboard/billing`,
  })

  const response = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const err = await response.json() as { error?: { message?: string } }
    throw createError({ statusCode: 502, message: err.error?.message || 'Stripe error' })
  }

  const session = await response.json() as { url: string }
  return { url: session.url }
})
