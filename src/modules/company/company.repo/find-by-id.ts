import { eq, and, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { companies } from '@/db/schema'
import * as Entity from '@/entities/company.entity'

export async function findCompanyById(req: Entity.GetCompanyReq): Promise<Entity.Company | null> {
  const conditions = [eq(companies.id, req.id ?? ''), isNull(companies.deletedAt)]

  if (req.accessible_company_id) {
    if (req.id && req.id !== req.accessible_company_id) {
      return null
    }
    conditions[0] = eq(companies.id, req.accessible_company_id)
  }

  const exec = getExecutor()
  const [row] = await exec
    .select()
    .from(companies)
    .where(and(...conditions))
    .limit(1)
  return (row as Entity.Company) ?? null
}
