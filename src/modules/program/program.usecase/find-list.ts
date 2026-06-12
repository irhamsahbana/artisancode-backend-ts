import * as Entity from '@/entities/program.entity'

import { ProgramUsecaseDeps } from '../program.usecase'

export async function findProgramList(
  deps: ProgramUsecaseDeps,
  req: Entity.GetProgramReq,
): Promise<Entity.ProgramList> {
  return deps.repo.findList(req)
}
