import { IBranchRepo } from '@/contracts/branch.contract'
import { branches } from '@/db/schema'
import * as Entity from '@/entities/branch.entity'

import { createBranch } from './branch.repo/create'
import { deleteBranch } from './branch.repo/delete'
import { findBranchById } from './branch.repo/find-by-id'
import { findBranchList } from './branch.repo/find-list'
import { updateBranch } from './branch.repo/update'

export interface BranchRepoDeps {
  toEntity: (data: typeof branches.$inferSelect) => Entity.Branch
}

function toEntity(data: typeof branches.$inferSelect): Entity.Branch {
  return {
    id: data.id,
    company_id: data.companyId,
    name: data.name,
    city: data.city,
    capacity: data.capacity,
    description: data.description,
    address: data.address,
    phone: data.phone,
    email: data.email,
    head_coach: data.headCoach,
    status: data.status,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
    deleted_at: data.deletedAt,
  }
}

export function createBranchRepo(): IBranchRepo {
  const deps: BranchRepoDeps = { toEntity }

  return {
    create: (req) => createBranch(deps, req),
    update: (req) => updateBranch(deps, req),
    delete: (id, companyId) => deleteBranch(id, companyId),
    findById: (id, companyId) => findBranchById(deps, id, companyId),
    findList: (req) => findBranchList(deps, req),
  }
}

export default createBranchRepo
