import * as Entity from '@/entities/user.entity'

import { UserUsecaseDeps } from '../user.usecase'

export async function findUserByUsername(
  deps: UserUsecaseDeps,
  username: string,
): Promise<Entity.User | null> {
  return deps.repo.findByUsername(username)
}
