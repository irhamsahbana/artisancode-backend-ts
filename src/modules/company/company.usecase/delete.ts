import { AppError } from '@/common/app_error'
import * as Entity from '@/entities/company.entity'

import { CompanyUsecaseDeps } from '../company.usecase'

export async function deleteCompany(
  deps: CompanyUsecaseDeps,
  req: Entity.GetCompanyReq,
): Promise<void> {
  const existing = await deps.repo.findById(req)
  if (!existing) {
    throw new AppError(404, 'Company not found')
  }
  await deps.repo.delete(req)
}
