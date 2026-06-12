import { AppError } from '@/common/app_error'
import { selectValidPrice } from '@/common/utils/select_valid_price'
import * as Entity from '@/entities/enrollment.entity'
import { Program, ProgramStatuses } from '@/entities/program.entity'
import { InactiveStudentStatuses, StudentStatus } from '@/entities/student.entity'

import { EnrollmentUsecaseDeps } from '../enrollment.usecase'

export async function updateEnrollment(
  deps: EnrollmentUsecaseDeps,
  req: Entity.UpdateEnrollmentReq,
): Promise<Entity.Enrollment> {
  const enrollment = await deps.repo.findById(req.id, req.company_id)
  if (!enrollment) {
    throw new AppError(404, 'Enrollment not found')
  }

  const effectiveBranchId = req.branch_id ?? enrollment.branch_id
  const effectiveStudentId = req.student_id ?? enrollment.student_id
  const effectiveProgramId = req.program_id ?? enrollment.program_id
  const effectiveStatus = (req.status ?? enrollment.status) as Entity.EnrollmentStatus
  const effectiveEnrollmentDate = req.enrollment_date
    ? new Date(req.enrollment_date)
    : enrollment.enrollment_date
      ? new Date(enrollment.enrollment_date)
      : new Date()

  if (req.branch_id) {
    const branch = await deps.branchRepo.findById(req.branch_id, req.company_id)
    if (!branch) {
      throw new AppError(404, 'Branch not found')
    }
  }

  let student = null
  if (req.student_id || effectiveStatus === 'active') {
    student = await deps.studentRepo.findById(effectiveStudentId, req.company_id)
    if (!student) {
      throw new AppError(404, 'Student not found')
    }
    if (InactiveStudentStatuses.includes(student.status as StudentStatus)) {
      throw new AppError(400, 'Student is not active')
    }
  }

  if (student && student.branch_id !== effectiveBranchId) {
    throw new AppError(400, 'Student belongs to a different branch')
  }

  let program: Program | null = null
  const resolveProgram = async () => {
    if (program) return program
    program = await deps.programRepo.findById(effectiveProgramId, req.company_id)
    if (!program) {
      throw new AppError(404, 'Program not found')
    }
    return program
  }

  if (req.program_id || req.pricing_id || req.enrollment_date || req.status || req.branch_id) {
    const programData = await resolveProgram()

    if (effectiveStatus === 'active') {
      if (!ProgramStatuses.includes(programData.status) || programData.status !== 'active') {
        throw new AppError(400, 'Program is not active')
      }
    }

    if (programData.branch_id && programData.branch_id !== effectiveBranchId) {
      throw new AppError(400, 'Program is not available in this branch')
    }

    if (programData.capacity && effectiveStatus === 'active') {
      const activeEnrollments = await deps.repo.countActiveByProgram(
        effectiveProgramId,
        req.company_id,
      )
      const adjustedActiveEnrollments =
        enrollment.status === 'active' && enrollment.program_id === effectiveProgramId
          ? Math.max(0, activeEnrollments - 1)
          : activeEnrollments

      if (adjustedActiveEnrollments >= programData.capacity) {
        throw new AppError(400, 'Program capacity reached')
      }
    }
  }

  if (req.pricing_id || req.program_id || req.enrollment_date || req.currency) {
    const programData = await resolveProgram()
    const pricingId = req.pricing_id ?? enrollment.pricing_id
    const pricing = programData.pricings?.find((p) => p.id === pricingId)
    if (!pricing) {
      throw new AppError(400, 'Invalid pricing for this program')
    }
    if (!pricing.is_active) {
      throw new AppError(400, 'Selected pricing is not active')
    }
    const prices = pricing.prices || []
    const effectiveCurrency = req.currency ?? enrollment.currency

    if (effectiveCurrency) {
      const priceCandidates = prices.filter((price) => price.currency === effectiveCurrency)
      const validPrice = selectValidPrice(priceCandidates, effectiveEnrollmentDate)
      if (!validPrice) {
        throw new AppError(
          400,
          'Selected pricing package has no valid price for the enrollment currency',
        )
      }
    } else {
      const validPrice = selectValidPrice(prices, effectiveEnrollmentDate)
      if (!validPrice) {
        throw new AppError(
          400,
          'Selected pricing package has no valid price for the enrollment date',
        )
      }
      req.currency = validPrice.currency
    }
  }

  if (req.billing_cycle) {
    const validCycles = ['monthly', 'quarterly', 'annually', 'one_time']
    if (!validCycles.includes(req.billing_cycle)) {
      throw new AppError(400, 'Invalid billing cycle')
    }
  }

  if (req.next_billing_date) {
    const nextBillingDate = new Date(req.next_billing_date)
    if (nextBillingDate <= effectiveEnrollmentDate) {
      throw new AppError(400, 'Next billing date must be after enrollment date')
    }
  }

  if (effectiveStatus === 'active') {
    const existingActiveEnrollment = await deps.repo.findActiveByStudentAndProgram(
      effectiveStudentId,
      effectiveProgramId,
      req.company_id,
    )

    if (existingActiveEnrollment && existingActiveEnrollment.id !== enrollment.id) {
      throw new AppError(400, 'Student is already active in this program')
    }

    const programData = await resolveProgram()
    if (programData.schedules && programData.schedules.length > 0) {
      const activeEnrollments = await deps.repo.findActiveByStudent(
        effectiveStudentId,
        req.company_id,
      )
      const filteredEnrollments = activeEnrollments.filter((item) => item.id !== enrollment.id)
      await deps.checkScheduleConflict(programData, filteredEnrollments)
    }
  }

  return deps.repo.update(req)
}
