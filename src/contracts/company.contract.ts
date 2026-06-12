import * as Entity from '@/entities/company.entity'

export interface ICompanyUsecase {
  create(req: Entity.CreateCompanyReq): Promise<Entity.Company>
  findList(req: Entity.GetCompanyReq): Promise<Entity.CompanyList>
  findById(req: Entity.GetCompanyReq): Promise<Entity.Company | null>
  update(req: Entity.UpdateCompanyReq): Promise<Entity.Company>
  delete(req: Entity.GetCompanyReq): Promise<void>
}

export interface ICompanyRepo {
  create(req: Entity.CreateCompanyReq): Promise<Entity.Company>
  findList(req: Entity.GetCompanyReq): Promise<Entity.CompanyList>
  findById(req: Entity.GetCompanyReq): Promise<Entity.Company | null>
  update(req: Entity.UpdateCompanyReq): Promise<Entity.Company>
  delete(req: Entity.GetCompanyReq): Promise<void>
}
