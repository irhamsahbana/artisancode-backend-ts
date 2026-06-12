import { getExecutor } from '@/common/executor'
import { users } from '@/db/schema'
import * as Entity from '@/entities/user.entity'

import { UserRepoDeps } from '../user.repo'

export async function createUser(
  deps: UserRepoDeps,
  req: Entity.CreateUserReq,
): Promise<Entity.User> {
  const [row] = await getExecutor()
    .insert(users)
    .values({
      name: req.name,
      username: req.username,
      email: req.email,
      password: req.password,
      phone: req.phone,
      companyId: req.company_id,
      roleId: req.role_id,
      status: req.status || 'active',
    })
    .returning()
  return deps.toEntity(row)
}
