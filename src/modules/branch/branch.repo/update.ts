import { eq, and, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { branches } from '@/db/schema'
import * as Entity from '@/entities/branch.entity'

import { BranchRepoDeps } from '../branch.repo'

export async function updateBranch(
  deps: BranchRepoDeps,
  req: Entity.UpdateBranchReq,
): Promise<Entity.Branch> {
  const [row] = await getExecutor()
    .update(branches)
    .set({
      name: req.name,
      city: req.city,
      capacity: req.capacity,
      description: req.description,
      address: req.address,
      phone: req.phone,
      email: req.email,
      headCoach: req.head_coach,
      status: req.status as 'active' | 'inactive',
    })
    .where(
      and(
        eq(branches.id, req.id),
        eq(branches.companyId, req.company_id),
        isNull(branches.deletedAt),
      ),
    )
    .returning()
  return deps.toEntity(row)
}
