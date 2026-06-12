import * as Entity from '@/entities/branch.entity'

export interface IBranchRepo {
  create(req: Entity.CreateBranchReq): Promise<Entity.Branch>
  update(req: Entity.UpdateBranchReq): Promise<Entity.Branch>
  delete(id: string, companyId: string): Promise<void>
  findById(id: string, companyId: string): Promise<Entity.Branch | null>
  findList(req: Entity.GetBranchReq): Promise<Entity.BranchList>
}

export interface IBranchUsecase {
  create(req: Entity.CreateBranchReq): Promise<Entity.Branch>
  update(req: Entity.UpdateBranchReq): Promise<Entity.Branch>
  delete(id: string, companyId: string): Promise<void>
  findById(id: string, companyId: string): Promise<Entity.Branch | null>
  findList(req: Entity.GetBranchReq): Promise<Entity.BranchList>
}
