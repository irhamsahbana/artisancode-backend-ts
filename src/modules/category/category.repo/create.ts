import { getExecutor } from '@/common/executor'
import { categories } from '@/db/schema'
import * as Entity from '@/entities/category.entity'

import { CategoryRepoDeps } from '../category.repo'

export async function createCategory(
  deps: CategoryRepoDeps,
  req: Entity.CreateCategoryReq,
): Promise<Entity.Category> {
  const [row] = await getExecutor()
    .insert(categories)
    .values({
      companyId: req.company_id,
      parentId: req.parent_id,
      group: req.group || '',
      name: req.name,
      status: (req.status as 'active' | 'inactive') ?? 'active',
    })
    .returning()
  return deps.toEntity(row)
}
