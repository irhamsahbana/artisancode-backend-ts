import { ICompanyRepo } from '@/contracts/company.contract'

import { createCompany } from './company.repo/create'
import { deleteCompany } from './company.repo/delete'
import { findCompanyById } from './company.repo/find-by-id'
import { findCompanyList } from './company.repo/find-list'
import { updateCompany } from './company.repo/update'

export function createCompanyRepo(): ICompanyRepo {
  return {
    create: (req) => createCompany(req),
    findList: (req) => findCompanyList(req),
    findById: (req) => findCompanyById(req),
    update: (req) => updateCompany(req),
    delete: (req) => deleteCompany(req),
  }
}

export default createCompanyRepo
