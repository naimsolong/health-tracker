import { eq } from 'drizzle-orm'
import { users, userFiles } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export default defineEventHandler(async (event) => {
  const authUser = await requireAuth(event)
  const db = useDb(event)

  // Check subscription
  const user = await db
    .select({ subscriptionStatus: users.subscriptionStatus })
    .from(users)
    .where(eq(users.id, authUser.id))
    .get()

  if (!user || user.subscriptionStatus !== 'active') {
    throw createError({ statusCode: 403, message: 'Pro subscription required to upload files' })
  }

  const body = await readBody(event) as { filename?: string; mimeType?: string; fileSize?: number }
  const { filename, mimeType, fileSize } = body

  if (!filename || !mimeType) {
    throw createError({ statusCode: 400, message: 'filename and mimeType are required' })
  }

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw createError({ statusCode: 400, message: 'File type not allowed. Use PDF, JPEG, PNG, WEBP, or TXT.' })
  }

  // Require fileSize — reject if missing or exceeds limit (client must always supply it)
  if (!fileSize || typeof fileSize !== 'number' || fileSize <= 0 || fileSize > MAX_FILE_SIZE) {
    throw createError({ statusCode: 400, message: 'fileSize is required and must be between 1 byte and 10 MB' })
  }

  if (typeof filename !== 'string' || filename.length > 255) {
    throw createError({ statusCode: 400, message: 'filename must be 255 characters or fewer' })
  }

  // Sanitize filename and build R2 key
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const r2Key = `users/${authUser.id}/${Date.now()}_${sanitized}`

  // Generate presigned PUT URL via R2's S3-compatible API
  const { cloudflare } = event.context as { cloudflare?: { env?: Record<string, unknown> } }
  const bucket = cloudflare?.env?.FILES_BUCKET as R2Bucket | undefined

  if (!bucket) {
    throw createError({ statusCode: 500, message: 'File storage not configured' })
  }

  // R2 doesn't support presigned URLs in the Workers runtime directly —
  // instead we save the file reference and return a one-time upload token
  // For a real deployment use @aws-sdk/s3-request-presigner with R2's S3 API endpoint
  // Here we save the DB row and return the r2Key so the client can POST to our confirm endpoint
  const [file] = await db
    .insert(userFiles)
    .values({
      userId: authUser.id,
      r2Key,
      filename,
      fileSize: fileSize ?? null,
      mimeType,
    })
    .returning()

  // Do NOT expose r2Key — internal storage path is not needed by the client
  return { fileId: file.id, uploadReady: true }
})

// Minimal R2Bucket type for TypeScript
interface R2Bucket {
  put(key: string, value: ArrayBuffer | ArrayBufferView | ReadableStream, options?: object): Promise<unknown>
  delete(key: string): Promise<void>
}
