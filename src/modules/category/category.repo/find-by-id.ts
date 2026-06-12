import { eq, and, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { categories } from '@/db/schema'
import * as Entity from '@/entities/category.entity'

import { CategoryRepoDeps } from '../category.repo'

export async function findCategoryById(
  deps: CategoryRepoDeps,
  id: string,
  companyId: string,
): Promise<Entity.Category | null> {
  const [row] = await getExecutor()
    .select()
    .from(categories)
    .where(
      and(
        eq(categories.id, id),
        eq(categories.companyId, companyId),
        isNull(categories.deletedAt),
      ),
    )
    .limit(1)
  return row ? deps.toEntity(row) : null
}
