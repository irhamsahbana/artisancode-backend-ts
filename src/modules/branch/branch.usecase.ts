import { AppError } from '@/common/app_error'
import * as Entity from '@/entities/branch.entity'

import { IBranchRepo, IBranchUsecase } from './branch.contract'

export default class BranchUsecase implements IBranchUsecase {
  constructor(private repo: IBranchRepo) {}

  async create(req: Entity.CreateBranchReq): Promise<Entity.Branch> {
    return this.repo.create(req)
  }

  async update(req: Entity.UpdateBranchReq): Promise<Entity.Branch> {
    // Check existence and ownership
    const branch = await this.repo.findById(req.id, req.company_id)
    if (!branch) {
      throw new AppError(404, 'Branch not found')
    }
    return this.repo.update(req)
  }

  async delete(id: string, companyId: string): Promise<void> {
    const branch = await this.repo.findById(id, companyId)
    if (!branch) {
      throw new AppError(404, 'Branch not found')
    }
    return this.repo.delete(id, companyId)
  }

  async findById(id: string, companyId: string): Promise<Entity.Branch | null> {
    return this.repo.findById(id, companyId)
  }

  async findList(req: Entity.GetBranchReq): Promise<Entity.BranchList> {
    return this.repo.findList(req)
  }
}
