import { getExecutor } from '@/common/executor'
import { branches } from '@/db/schema'
import * as Entity from '@/entities/branch.entity'

import { BranchRepoDeps } from '../branch.repo'

export async function createBranch(
  deps: BranchRepoDeps,
  req: Entity.CreateBranchReq,
): Promise<Entity.Branch> {
  const [row] = await getExecutor()
    .insert(branches)
    .values({
      companyId: req.company_id,
      name: req.name,
      city: req.city,
      capacity: req.capacity ?? 0,
      description: req.description ?? '',
      address: req.address ?? '',
      phone: req.phone ?? '',
      email: req.email ?? '',
      headCoach: req.head_coach ?? '',
      status: (req.status as 'active' | 'inactive') ?? 'active',
    })
    .returning()
  return deps.toEntity(row)
}
