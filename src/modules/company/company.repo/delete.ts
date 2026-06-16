import { eq } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { AppError } from '@/common/packages/types'
import { companies } from '@/db/schema'
import * as Entity from '@/entities/company.entity'

import { CompanyErrorCode } from '../company.errors'

export async function deleteCompany(req: Entity.GetCompanyReq): Promise<void> {
  if (req.accessible_company_id && req.id !== req.accessible_company_id) {
    throw new AppError(CompanyErrorCode.NOT_FOUND, 'Company not found', { httpCode: 404 })
  }

  const exec = getExecutor()
  await exec
    .update(companies)
    .set({ deletedAt: new Date() })
    .where(eq(companies.id, req.id ?? ''))
}
