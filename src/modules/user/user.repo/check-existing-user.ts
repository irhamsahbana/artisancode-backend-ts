import { eq, or, sql } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { users } from '@/db/schema'

export async function checkExistingUser(username: string, email: string): Promise<boolean> {
  const [result] = await getExecutor()
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(or(eq(users.username, username), eq(users.email, email)))
  return result.count > 0
}
