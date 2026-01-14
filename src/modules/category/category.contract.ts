import * as Entity from '@/entities/category.entity'

export interface ICategoryRepo {
  create(req: Entity.CreateCategoryReq): Promise<Entity.Category>
  update(req: Entity.UpdateCategoryReq): Promise<Entity.Category>
  delete(id: string, companyId: string): Promise<void>
  findById(id: string, companyId: string): Promise<Entity.Category | null>
  findList(req: Entity.GetCategoryReq): Promise<Entity.CategoryList>
}

export interface ICategoryUsecase {
  create(req: Entity.CreateCategoryReq): Promise<Entity.Category>
  update(req: Entity.UpdateCategoryReq): Promise<Entity.Category>
  delete(id: string, companyId: string): Promise<void>
  findById(id: string, companyId: string): Promise<Entity.Category | null>
  findList(req: Entity.GetCategoryReq): Promise<Entity.CategoryList>
}
