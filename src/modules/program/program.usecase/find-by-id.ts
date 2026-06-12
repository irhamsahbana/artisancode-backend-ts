import * as Entity from '@/entities/program.entity'

import { ProgramUsecaseDeps } from '../program.usecase'

export async function findProgramById(
  deps: ProgramUsecaseDeps,
  id: string,
  companyId: string,
): Promise<Entity.Program | null> {
  return deps.repo.findById(id, companyId)
}
