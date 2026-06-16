import { eq } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { AppError } from '@/common/packages/types'
import { companies } from '@/db/schema'
import * as Entity from '@/entities/company.entity'

import { CompanyErrorCode } from '../company.errors'

export async function updateCompany(req: Entity.UpdateCompanyReq): Promise<Entity.Company> {
  const status = req.status === 'inactive' ? 'inactive' : 'active'

  if (req.accessible_company_id && req.id !== req.accessible_company_id) {
    throw new AppError(CompanyErrorCode.NOT_FOUND, 'Company not found', { httpCode: 404 })
  }

  const exec = getExecutor()
  const [row] = await exec
    .update(companies)
    .set({
      ...req,
      status: req.status ? status : undefined,
    })
    .where(eq(companies.id, req.id))
    .returning()

  return row as Entity.Company
}
