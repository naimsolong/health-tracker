import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'
import { useDb } from '../../utils/db'

// Verify Stripe webhook signature using Web Crypto API
async function verifyStripeSignature(payload: string, sigHeader: string, secret: string): Promise<boolean> {
  try {
    const parts = sigHeader.split(',').reduce<Record<string, string>>((acc, part) => {
      const [k, v] = part.split('=')
      acc[k] = v
      return acc
    }, {})

    const timestamp = parts['t']
    const signature = parts['v1']
    if (!timestamp || !signature) return false

    // Reject events older than 5 minutes (prevents replay attacks)
    const now = Math.floor(Date.now() / 1000)
    if (Math.abs(now - Number(timestamp)) > 300) return false

    const signedPayload = `${timestamp}.${payload}`
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const messageData = encoder.encode(signedPayload)

    const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const hashBuffer = await crypto.subtle.sign('HMAC', key, messageData)
    const computed = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    return computed === signature
  } catch {
    return false
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const db = useDb(event)

  const rawBody = await readRawBody(event) || ''
  const sigHeader = getRequestHeader(event, 'stripe-signature') || ''

  const valid = await verifyStripeSignature(rawBody, sigHeader, config.stripeWebhookSecret)
  if (!valid) {
    throw createError({ statusCode: 400, message: 'Invalid signature' })
  }

  const webhookEvent = JSON.parse(rawBody) as {
    type: string
    data: { object: Record<string, unknown> }
  }

  const obj = webhookEvent.data.object

  if (
    webhookEvent.type === 'customer.subscription.created' ||
    webhookEvent.type === 'customer.subscription.updated'
  ) {
    const customerId = obj['customer'] as string
    const subscriptionId = obj['id'] as string
    const status = obj['status'] as string
    const subscriptionStatus = status === 'active' || status === 'trialing' ? 'active' : status

    await db
      .update(users)
      .set({ stripeSubscriptionId: subscriptionId, subscriptionStatus })
      .where(eq(users.stripeCustomerId, customerId))

    // If this is a new customer, try to link by metadata user_id
    const metadata = obj['metadata'] as Record<string, string> | undefined
    if (metadata?.user_id) {
      const userId = Number(metadata.user_id)
      await db
        .update(users)
        .set({ stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId, subscriptionStatus })
        .where(eq(users.id, userId))
    }
  }

  if (webhookEvent.type === 'customer.subscription.deleted') {
    const customerId = obj['customer'] as string
    await db
      .update(users)
      .set({ subscriptionStatus: 'canceled', stripeSubscriptionId: null })
      .where(eq(users.stripeCustomerId, customerId))
  }

  if (webhookEvent.type === 'invoice.payment_failed') {
    const customerId = obj['customer'] as string
    await db
      .update(users)
      .set({ subscriptionStatus: 'past_due' })
      .where(eq(users.stripeCustomerId, customerId))
  }

  return { received: true }
})
