import { eq, and, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { users } from '@/db/schema'
import * as Entity from '@/entities/user.entity'

import { UserRepoDeps } from '../user.repo'

export async function findUserByUsername(
  deps: UserRepoDeps,
  username: string,
): Promise<Entity.User | null> {
  const [row] = await getExecutor()
    .select()
    .from(users)
    .where(and(eq(users.username, username), isNull(users.deletedAt)))
    .limit(1)
  return row ? deps.toEntity(row) : null
}
