import { AppError, ErrorCode } from '@/common/packages/types'
import * as Entity from '@/entities/company.entity'

import { CompanyUsecaseDeps } from '../company.usecase'

export async function deleteCompany(
  deps: CompanyUsecaseDeps,
  req: Entity.GetCompanyReq,
): Promise<void> {
  const existing = await deps.repo.findById(req)
  if (!existing) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Company not found')
  }
  await deps.repo.delete(req)
}
