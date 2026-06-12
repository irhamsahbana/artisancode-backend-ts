import { ITransactor } from '@/contracts/integration'
import * as Entity from '@/entities/enrollment.entity'
import { Program } from '@/entities/program.entity'
import { IBranchRepo } from '@/modules/branch/branch.contract'
import { IInvoiceUsecase } from '@/modules/invoice/invoice.contract'
import { IProgramRepo } from '@/modules/program/program.contract'
import { IStudentRepo } from '@/modules/student/student.contract'
import { withSpan } from '@/telemetry'

import { IEnrollmentRepo, IEnrollmentUsecase } from './enrollment.contract'
import { checkScheduleConflict } from './enrollment.usecase/check-schedule-conflict'
import { createEnrollment } from './enrollment.usecase/create'
import { deleteEnrollment } from './enrollment.usecase/delete'
import { findEnrollmentById } from './enrollment.usecase/find-by-id'
import { findEnrollmentList } from './enrollment.usecase/find-list'
import { generateEnrollmentInvoice } from './enrollment.usecase/generate-invoice'
import { updateEnrollment } from './enrollment.usecase/update'

export interface EnrollmentUsecaseDeps {
  repo: IEnrollmentRepo
  branchRepo: IBranchRepo
  studentRepo: IStudentRepo
  programRepo: IProgramRepo
  invoiceUsecase: IInvoiceUsecase
  transactor: ITransactor
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
): IEnrollmentUsecase {
  const deps: EnrollmentUsecaseDeps = {
    repo,
    branchRepo,
    studentRepo,
    programRepo,
    invoiceUsecase,
    transactor,
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
  }
}

export default createEnrollmentUsecase
