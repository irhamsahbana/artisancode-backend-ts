import { IBranchRepo } from '@/contracts/branch.contract'
import { IEnrollmentRepo, IEnrollmentUsecase } from '@/contracts/enrollment.contract'
import { IStorageService, ITransactor } from '@/contracts/integration'
import { IInvoiceUsecase } from '@/contracts/invoice.contract'
import { IProgramRepo } from '@/contracts/program.contract'
import { IStudentRepo } from '@/contracts/student.contract'
import * as Entity from '@/entities/enrollment.entity'
import { Program } from '@/entities/program.entity'
import { withSpan } from '@/telemetry'

import { checkScheduleConflict } from './enrollment.usecase/check-schedule-conflict'
import { createEnrollment } from './enrollment.usecase/create'
import { deleteEnrollment } from './enrollment.usecase/delete'
import { findEnrollmentById } from './enrollment.usecase/find-by-id'
import { findEnrollmentList } from './enrollment.usecase/find-list'
import { generateEnrollmentInvoice } from './enrollment.usecase/generate-invoice'
import { updateEnrollment } from './enrollment.usecase/update'
import { uploadPaymentProof } from './enrollment.usecase/upload-payment-proof'

export interface EnrollmentUsecaseDeps {
  repo: IEnrollmentRepo
  branchRepo: IBranchRepo
  studentRepo: IStudentRepo
  programRepo: IProgramRepo
  invoiceUsecase: IInvoiceUsecase
  transactor: ITransactor
  storage: IStorageService
  checkScheduleConflict: (
    newProgram: Program,
    existingEnrollments: Entity.Enrollment[],
  ) => Promise<void>
}

export function createEnrollmentUsecase(
  repo: IEnrollmentRepo,
  branchRepo: IBranchRepo,
  studentRepo: IStudentRepo,
  programRepo: IProgramRepo,
  invoiceUsecase: IInvoiceUsecase,
  transactor: ITransactor,
  storage: IStorageService,
): IEnrollmentUsecase {
  const deps: EnrollmentUsecaseDeps = {
    repo,
    branchRepo,
    studentRepo,
    programRepo,
    invoiceUsecase,
    transactor,
    storage,
    checkScheduleConflict: (newProgram, existingEnrollments) =>
      checkScheduleConflict(deps, newProgram, existingEnrollments),
  }

  return {
    create: (req) =>
      withSpan('enrollment.usecase', 'EnrollmentUsecase.create', () => createEnrollment(deps, req)),
    update: (req) =>
      withSpan('enrollment.usecase', 'EnrollmentUsecase.update', () => updateEnrollment(deps, req)),
    generateInvoice: (req) =>
      withSpan('enrollment.usecase', 'EnrollmentUsecase.generateInvoice', () =>
        generateEnrollmentInvoice(deps, req)),
    delete: (id, companyId) =>
      withSpan('enrollment.usecase', 'EnrollmentUsecase.delete', () =>
        deleteEnrollment(deps, id, companyId)),
    findById: (id, companyId) =>
      withSpan('enrollment.usecase', 'EnrollmentUsecase.findById', () =>
        findEnrollmentById(deps, id, companyId)),
    findList: (req) =>
      withSpan('enrollment.usecase', 'EnrollmentUsecase.findList', () =>
        findEnrollmentList(deps, req)),
    uploadPaymentProof: (req) =>
      withSpan('enrollment.usecase', 'EnrollmentUsecase.uploadPaymentProof', () =>
        uploadPaymentProof(deps, req)),
  }
}

export default createEnrollmentUsecase
