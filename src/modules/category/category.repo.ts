import { ICategoryRepo } from '@/contracts/category.contract'
import { categories } from '@/db/schema'
import * as Entity from '@/entities/category.entity'

import { createCategory } from './category.repo/create'
import { deleteCategory } from './category.repo/delete'
import { findCategoryById } from './category.repo/find-by-id'
import { findCategoryList } from './category.repo/find-list'
import { updateCategory } from './category.repo/update'

export interface CategoryRepoDeps {
  toEntity: (data: typeof categories.$inferSelect) => Entity.Category
}

function toEntity(data: typeof categories.$inferSelect): Entity.Category {
  return {
    id: data.id,
    company_id: data.companyId || '',
    parent_id: data.parentId,
    group: data.group,
    name: data.name,
    status: data.status,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
    deleted_at: data.deletedAt,
  }
}

export function createCategoryRepo(): ICategoryRepo {
  const deps: CategoryRepoDeps = { toEntity }

  return {
    create: (req) => createCategory(deps, req),
    update: (req) => updateCategory(deps, req),
    delete: (id, companyId) => deleteCategory(id, companyId),
    findById: (id, companyId) => findCategoryById(deps, id, companyId),
    findList: (req) => findCategoryList(deps, req),
  }
}

export default createCategoryRepo
