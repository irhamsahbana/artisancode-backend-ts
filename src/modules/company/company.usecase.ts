import { ICompanyRepo, ICompanyUsecase } from '@/contracts/company.contract'
import { withSpan } from '@/telemetry'

import { createCompany } from './company.usecase/create'
import { deleteCompany } from './company.usecase/delete'
import { findCompanyById } from './company.usecase/find-by-id'
import { findCompanyList } from './company.usecase/find-list'
import { updateCompany } from './company.usecase/update'

export interface CompanyUsecaseDeps {
  repo: ICompanyRepo
}

export function createCompanyUsecase(repo: ICompanyRepo): ICompanyUsecase {
  const deps: CompanyUsecaseDeps = { repo }

  return {
    create: (req) =>
      withSpan('company.usecase', 'CompanyUsecase.create', () => createCompany(deps, req)),
    findList: (req) => findCompanyList(deps, req),
    findById: (req) => findCompanyById(deps, req),
    update: (req) =>
      withSpan('company.usecase', 'CompanyUsecase.update', () => updateCompany(deps, req)),
    delete: (req) => deleteCompany(deps, req),
  }
}

export default createCompanyUsecase
