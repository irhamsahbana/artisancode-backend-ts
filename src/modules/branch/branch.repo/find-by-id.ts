import { eq, and, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { branches } from '@/db/schema'
import * as Entity from '@/entities/branch.entity'

import { BranchRepoDeps } from '../branch.repo'

export async function findBranchById(
  deps: BranchRepoDeps,
  id: string,
  companyId: string,
): Promise<Entity.Branch | null> {
  const [row] = await getExecutor()
    .select()
    .from(branches)
    .where(
      and(eq(branches.id, id), eq(branches.companyId, companyId), isNull(branches.deletedAt)),
    )
    .limit(1)
  return row ? deps.toEntity(row) : null
}
