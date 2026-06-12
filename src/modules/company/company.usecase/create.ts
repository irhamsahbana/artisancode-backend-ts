import * as Entity from '@/entities/company.entity'

import { CompanyUsecaseDeps } from '../company.usecase'

export async function createCompany(
  deps: CompanyUsecaseDeps,
  req: Entity.CreateCompanyReq,
): Promise<Entity.Company> {
  return deps.repo.create(req)
}
