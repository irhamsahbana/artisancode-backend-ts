import { eq, and, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { users } from '@/db/schema'
import * as Entity from '@/entities/user.entity'

import { UserRepoDeps } from '../user.repo'

export async function findUserById(
  deps: UserRepoDeps,
  id: string,
  companyId?: string,
): Promise<Entity.User | null> {
  const conditions = [eq(users.id, id), isNull(users.deletedAt)]
  if (companyId) {
    conditions.push(eq(users.companyId, companyId))
  }

  const [row] = await getExecutor()
    .select()
    .from(users)
    .where(and(...conditions))
    .limit(1)
  return row ? deps.toEntity(row) : null
}
