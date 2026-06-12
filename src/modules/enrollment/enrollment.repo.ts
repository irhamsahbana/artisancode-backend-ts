import { IEnrollmentRepo } from '@/contracts/enrollment.contract'

import {
  findEnrollmentWithRelations,
  findEnrollmentsWithRelations,
  toEnrollmentEntity,
} from './enrollment.mapper'
import { countActiveEnrollmentsByPricing } from './enrollment.repo/count-active-by-pricing'
import { countActiveEnrollmentsByProgram } from './enrollment.repo/count-active-by-program'
import { createEnrollment } from './enrollment.repo/create'
import { deleteEnrollment } from './enrollment.repo/delete'
import { findActiveEnrollmentsByStudent } from './enrollment.repo/find-active-by-student'
import { findActiveEnrollmentByStudentAndProgram } from './enrollment.repo/find-active-by-student-and-program'
import { findEnrollmentById } from './enrollment.repo/find-by-id'
import { findEnrollmentByStudentAndProgram } from './enrollment.repo/find-by-student-and-program'
import { findEnrollmentList } from './enrollment.repo/find-list'
import { updateEnrollment } from './enrollment.repo/update'

export interface EnrollmentRepoDeps {
  toEnrollmentEntity: typeof toEnrollmentEntity
  findEnrollmentWithRelations: typeof findEnrollmentWithRelations
  findEnrollmentsWithRelations: typeof findEnrollmentsWithRelations
}

export function createEnrollmentRepo(): IEnrollmentRepo {
  const deps: EnrollmentRepoDeps = {
    toEnrollmentEntity,
    findEnrollmentWithRelations,
    findEnrollmentsWithRelations,
  }

  return {
    create: (req) => createEnrollment(deps, req),
    update: (req) => updateEnrollment(deps, req),
    delete: (id, companyId) => deleteEnrollment(id, companyId),
    findById: (id, companyId) => findEnrollmentById(deps, id, companyId),
    findByStudentAndProgram: (studentId, programId, companyId) =>
      findEnrollmentByStudentAndProgram(deps, studentId, programId, companyId),
    findActiveByStudentAndProgram: (studentId, programId, companyId) =>
      findActiveEnrollmentByStudentAndProgram(deps, studentId, programId, companyId),
    findActiveByStudent: (studentId, companyId) =>
      findActiveEnrollmentsByStudent(deps, studentId, companyId),
    findList: (req) => findEnrollmentList(deps, req),
    countActiveByProgram: (programId, companyId) =>
      countActiveEnrollmentsByProgram(programId, companyId),
    countActiveByPricing: (pricingId, companyId) =>
      countActiveEnrollmentsByPricing(pricingId, companyId),
  }
}

export default createEnrollmentRepo
