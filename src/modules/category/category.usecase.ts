import { AppError } from '@/common/app_error'
import * as Entity from '@/entities/category.entity'

import { ICategoryRepo, ICategoryUsecase } from './category.contract'

export default class CategoryUsecase implements ICategoryUsecase {
  constructor(private repo: ICategoryRepo) {}

  async create(req: Entity.CreateCategoryReq): Promise<Entity.Category> {
    if (req.parent_id) {
      const parent = await this.repo.findById(req.parent_id, req.company_id)
      if (!parent) {
        throw new AppError(404, 'Parent category not found')
      }
    }
    return this.repo.create(req)
  }

  async update(req: Entity.UpdateCategoryReq): Promise<Entity.Category> {
    const category = await this.repo.findById(req.id, req.company_id)
    if (!category) {
      throw new AppError(404, 'Category not found')
    }

    if (req.parent_id) {
      if (req.parent_id === req.id) {
        throw new AppError(400, 'Category cannot be its own parent')
      }
      const parent = await this.repo.findById(req.parent_id, req.company_id)
      if (!parent) {
        throw new AppError(404, 'Parent category not found')
      }
    }

    return this.repo.update(req)
  }

  async delete(id: string, companyId: string): Promise<void> {
    const category = await this.repo.findById(id, companyId)
    if (!category) {
      throw new AppError(404, 'Category not found')
    }
    return this.repo.delete(id, companyId)
  }

  async findById(id: string, companyId: string): Promise<Entity.Category | null> {
    return this.repo.findById(id, companyId)
  }

  async findList(req: Entity.GetCategoryReq): Promise<Entity.CategoryList> {
    return this.repo.findList(req)
  }
}
