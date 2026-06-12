import { eq } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { companies } from '@/db/schema'
import * as Entity from '@/entities/company.entity'

export async function updateCompany(req: Entity.UpdateCompanyReq): Promise<Entity.Company> {
  const status = req.status === 'inactive' ? 'inactive' : 'active'

  if (req.accessible_company_id && req.id !== req.accessible_company_id) {
    throw new Error('Company not found')
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
