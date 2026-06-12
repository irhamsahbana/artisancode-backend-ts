import { getExecutor } from '@/common/executor'
import { companies } from '@/db/schema'
import * as Entity from '@/entities/company.entity'

export async function createCompany(req: Entity.CreateCompanyReq): Promise<Entity.Company> {
  const status = req.status === 'inactive' ? 'inactive' : 'active'
  const [row] = await getExecutor().insert(companies).values({ name: req.name, status }).returning()
  return row as Entity.Company
}
