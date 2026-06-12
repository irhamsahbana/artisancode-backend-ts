import { IEnrollmentUsecase } from '@/contracts/enrollment.contract'

import { createEnrollmentHandler } from './create'
import { deleteEnrollmentHandler } from './delete'
import { findEnrollmentByIdHandler } from './find-by-id'
import { findEnrollmentListHandler } from './find-list'
import { generateEnrollmentInvoiceHandler } from './generate-invoice'
import { updateEnrollmentHandler } from './update'

export function createEnrollmentHandlerDeps(usecase: IEnrollmentUsecase) {
  return {
    create: createEnrollmentHandler(usecase),
    update: updateEnrollmentHandler(usecase),
    generateInvoice: generateEnrollmentInvoiceHandler(usecase),
    delete: deleteEnrollmentHandler(usecase),
    findById: findEnrollmentByIdHandler(usecase),
    findList: findEnrollmentListHandler(usecase),
  }
}
