import { eq, and, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { products as productsTable } from '@/db/schema'
import * as Entity from '@/entities/program.entity'

import { ProgramRepoDeps } from '../program.repo'

export async function updateProgram(
  deps: ProgramRepoDeps,
  req: Entity.UpdateProgramReq,
): Promise<Entity.Program> {
  const { id, company_id, ...rest } = req
  await getExecutor()
    .update(productsTable)
    .set({
      branchId: rest.branch_id,
      name: rest.name,
      description: rest.description,
      capacity: rest.capacity,
      status: rest.status,
    })
    .where(
      and(
        eq(productsTable.id, id),
        eq(productsTable.companyId, company_id),
        isNull(productsTable.deletedAt),
      ),
    )

  return deps.toProgramEntity(await deps.fetchProductWithRelations(id))
}
