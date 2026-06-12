import { eq, and, ilike, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { products as productsTable } from '@/db/schema'
import * as Entity from '@/entities/program.entity'

import { ProgramRepoDeps } from '../program.repo'

export async function findProgramByName(
  deps: ProgramRepoDeps,
  name: string,
  companyId: string,
  branchId?: string | null,
): Promise<Entity.Program | null> {
  const conditions = [
    eq(productsTable.companyId, companyId),
    ilike(productsTable.name, name),
    isNull(productsTable.deletedAt),
  ]

  if (branchId !== undefined) {
    if (branchId === null) {
      conditions.push(isNull(productsTable.branchId))
    } else {
      conditions.push(eq(productsTable.branchId, branchId))
    }
  }

  const [product] = await getExecutor()
    .select()
    .from(productsTable)
    .where(and(...conditions))
    .limit(1)
  if (!product) return null
  return deps.toProgramEntity(await deps.fetchProductWithRelations(product.id))
}
