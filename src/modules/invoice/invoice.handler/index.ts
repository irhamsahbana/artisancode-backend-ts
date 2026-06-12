import { IInvoiceUsecase } from '@/contracts/invoice.contract'

import { createInvoiceHandler } from './create'
import { findInvoiceByIdHandler } from './find-by-id'
import { findInvoiceListHandler } from './find-list'

export function createInvoiceHandlerDeps(usecase: IInvoiceUsecase) {
  return {
    create: createInvoiceHandler(usecase),
    findById: findInvoiceByIdHandler(usecase),
    findList: findInvoiceListHandler(usecase),
  }
}
