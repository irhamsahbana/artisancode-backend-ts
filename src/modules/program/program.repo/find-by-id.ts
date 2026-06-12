import { eq, and, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { products as productsTable } from '@/db/schema'
import * as Entity from '@/entities/program.entity'

import { ProgramRepoDeps } from '../program.repo'

export async function findProgramById(
  deps: ProgramRepoDeps,
  id: string,
  companyId: string,
): Promise<Entity.Program | null> {
  const [product] = await getExecutor()
    .select()
    .from(productsTable)
    .where(
      and(
        eq(productsTable.id, id),
        eq(productsTable.companyId, companyId),
        isNull(productsTable.deletedAt),
      ),
    )
    .limit(1)
  if (!product) return null
  return deps.toProgramEntity(await deps.fetchProductWithRelations(id))
}
