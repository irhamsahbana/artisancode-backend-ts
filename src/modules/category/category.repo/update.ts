import { eq, and, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { categories } from '@/db/schema'
import * as Entity from '@/entities/category.entity'

import { CategoryRepoDeps } from '../category.repo'

export async function updateCategory(
  deps: CategoryRepoDeps,
  req: Entity.UpdateCategoryReq,
): Promise<Entity.Category> {
  const [row] = await getExecutor()
    .update(categories)
    .set({
      parentId: req.parent_id,
      group: req.group,
      name: req.name,
      status: req.status as 'active' | 'inactive',
    })
    .where(
      and(
        eq(categories.id, req.id),
        eq(categories.companyId, req.company_id),
        isNull(categories.deletedAt),
      ),
    )
    .returning()
  return deps.toEntity(row)
}
