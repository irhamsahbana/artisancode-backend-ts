import * as Entity from '@/entities/user.entity'

import { UserUsecaseDeps } from '../user.usecase'

export async function findUserById(
  deps: UserUsecaseDeps,
  id: string,
  companyId?: string,
): Promise<Entity.User | null> {
  return deps.repo.findById(id, companyId)
}
