import * as Entity from '@/entities/user.entity'

import { UserUsecaseDeps } from '../user.usecase'

export async function findUserList(
  deps: UserUsecaseDeps,
  req: Entity.GetUserReq,
): Promise<Entity.UserList> {
  return deps.repo.findList(req)
}
