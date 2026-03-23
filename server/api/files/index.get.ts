import { eq, desc } from 'drizzle-orm'
import { userFiles } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDb(event)

  const files = await db
    .select()
    .from(userFiles)
    .where(eq(userFiles.userId, user.id))
    .orderBy(desc(userFiles.createdAt))
    .all()

  return { files }
})
