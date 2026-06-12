import * as Entity from '@/entities/company.entity'

import { CompanyUsecaseDeps } from '../company.usecase'

export async function findCompanyList(
  deps: CompanyUsecaseDeps,
  req: Entity.GetCompanyReq,
): Promise<Entity.CompanyList> {
  return deps.repo.findList(req)
}
