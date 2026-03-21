import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const authUser = requireAuth(event)
  const db = useDb(event)

  const user = await db
    .select({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt, subscriptionStatus: users.subscriptionStatus })
    .from(users)
    .where(eq(users.id, authUser.id))
    .get()

  return { user }
})
