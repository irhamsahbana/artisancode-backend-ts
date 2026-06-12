import { AppError } from '@/common/app_error'
import * as Entity from '@/entities/company.entity'

import { CompanyUsecaseDeps } from '../company.usecase'

export async function updateCompany(
  deps: CompanyUsecaseDeps,
  req: Entity.UpdateCompanyReq,
): Promise<Entity.Company> {
  const existing = await deps.repo.findById(req)
  if (!existing) {
    throw new AppError(404, 'Company not found')
  }
  return deps.repo.update(req)
}
