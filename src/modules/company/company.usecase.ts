import * as Entity from '@/entities/company.entity'

import { ICompanyRepo, ICompanyUsecase } from './company.contract'

export default class CompanyUsecase implements ICompanyUsecase {
  constructor(private readonly repo: ICompanyRepo) {}

  async create(req: Entity.CreateCompanyReq): Promise<Entity.Company> {
    return await this.repo.create(req)
  }

  async findList(req: Entity.GetCompanyReq): Promise<Entity.CompanyList> {
    return await this.repo.findList(req)
  }

  async findById(req: Entity.GetCompanyReq): Promise<Entity.Company | null> {
    return await this.repo.findById(req)
  }

  async update(req: Entity.UpdateCompanyReq): Promise<Entity.Company> {
    const existing = await this.repo.findById(req)
    if (!existing) {
      throw new Error('Company not found')
    }
    return await this.repo.update(req)
  }

  async delete(req: Entity.GetCompanyReq): Promise<void> {
    const existing = await this.repo.findById(req)
    if (!existing) {
      throw new Error('Company not found')
    }
    await this.repo.delete(req)
  }
}
