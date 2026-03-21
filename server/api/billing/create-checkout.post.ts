import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const authUser = requireAuth(event)
  const config = useRuntimeConfig(event)
  const db = useDb(event)

  const user = await db
    .select({ id: users.id, name: users.name, email: users.email, stripeCustomerId: users.stripeCustomerId })
    .from(users)
    .where(eq(users.id, authUser.id))
    .get()

  if (!user) throw createError({ statusCode: 404, message: 'User not found' })

  // Determine the base URL for success/cancel redirects
  const host = getRequestHeader(event, 'host') || 'localhost:3000'
  const proto = host.includes('localhost') ? 'http' : 'https'
  const baseUrl = `${proto}://${host}`

  // Build Stripe Checkout session params
  const params = new URLSearchParams({
    'mode': 'subscription',
    'line_items[0][price]': config.stripePriceId,
    'line_items[0][quantity]': '1',
    'success_url': `${baseUrl}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`,
    'cancel_url': `${baseUrl}/dashboard/billing`,
    'customer_email': user.stripeCustomerId ? '' : user.email,
    'allow_promotion_codes': 'true',
    'metadata[user_id]': String(user.id),
  })

  // If user already has a Stripe customer, pass customer instead of email
  if (user.stripeCustomerId) {
    params.delete('customer_email')
    params.set('customer', user.stripeCustomerId)
  }

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
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
