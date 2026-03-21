import { eq, and } from 'drizzle-orm'
import { userFiles } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const db = useDb(event)
  const id = Number(getRouterParam(event, 'id'))

  if (!id) throw createError({ statusCode: 400, message: 'Invalid file id' })

  const file = await db
    .select()
    .from(userFiles)
    .where(and(eq(userFiles.id, id), eq(userFiles.userId, user.id)))
    .get()

  if (!file) throw createError({ statusCode: 404, message: 'File not found' })

  // Delete from R2 if bucket is available
  const { cloudflare } = event.context as { cloudflare?: { env?: Record<string, unknown> } }
  const bucket = cloudflare?.env?.FILES_BUCKET as { delete(key: string): Promise<void> } | undefined
  if (bucket) {
    await bucket.delete(file.r2Key)
  }

  await db.delete(userFiles).where(eq(userFiles.id, id))

  return { success: true }
})
