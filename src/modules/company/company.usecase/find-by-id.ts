import * as Entity from '@/entities/company.entity'

import { CompanyUsecaseDeps } from '../company.usecase'

export async function findCompanyById(
  deps: CompanyUsecaseDeps,
  req: Entity.GetCompanyReq,
): Promise<Entity.Company | null> {
  return deps.repo.findById(req)
}
