import { AppError, ErrorCode } from '@/common/packages/types'
import * as Entity from '@/entities/company.entity'

import { CompanyUsecaseDeps } from '../company.usecase'

export async function updateCompany(
  deps: CompanyUsecaseDeps,
  req: Entity.UpdateCompanyReq,
): Promise<Entity.Company> {
  const existing = await deps.repo.findById(req)
  if (!existing) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Company not found')
  }
  return deps.repo.update(req)
}
