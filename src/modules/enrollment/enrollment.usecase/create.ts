import { AppError, ErrorCode } from '@/common/packages/types'
import { selectValidPrice } from '@/common/utils/select_valid_price'
import * as Entity from '@/entities/enrollment.entity'
import { ProgramStatuses } from '@/entities/program.entity'
import { InactiveStudentStatuses, StudentStatus } from '@/entities/student.entity'

import { EnrollmentUsecaseDeps } from '../enrollment.usecase'

export async function createEnrollment(
  deps: EnrollmentUsecaseDeps,
  req: Entity.CreateEnrollmentReq,
): Promise<Entity.Enrollment> {
  const branch = await deps.branchRepo.findById(req.branch_id, req.company_id)
  if (!branch) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Branch not found')
  }

  const student = await deps.studentRepo.findById(req.student_id, req.company_id)
  if (!student) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Student not found')
  }

  if (InactiveStudentStatuses.includes(student.status as StudentStatus)) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, 'Student is not active')
  }

  if (student.branch_id !== req.branch_id) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, 'Student belongs to a different branch')
  }

  const program = await deps.programRepo.findById(req.program_id, req.company_id)
  if (!program) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Program not found')
  }

  if (!ProgramStatuses.includes(program.status) || program.status !== 'active') {
    throw new AppError(ErrorCode.VALIDATION_ERROR, 'Program is not active')
  }

  if (program.branch_id && program.branch_id !== req.branch_id) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, 'Program is not available in this branch')
  }

  if (program.capacity) {
    const activeEnrollments = await deps.repo.countActiveByProgram(
      req.program_id,
      req.company_id,
    )
    if (activeEnrollments >= program.capacity) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Program capacity reached')
    }
  }

  const pricing = program.pricings?.find((p) => p.id === req.pricing_id)
  if (!pricing) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid pricing for this program')
  }

  if (!pricing.is_active) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, 'Selected pricing is not active')
  }

  const enrollmentDate = req.enrollment_date ? new Date(req.enrollment_date) : new Date()
  const prices = pricing.prices || []
  let selectedPrice: { price: number } | undefined

  if (req.currency) {
    const priceCandidates = prices.filter((price) => price.currency === req.currency)
    const validPrice = selectValidPrice(priceCandidates, enrollmentDate)
    if (!validPrice) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Selected pricing package has no valid price for the enrollment currency',
      )
    }
    selectedPrice = validPrice
  } else {
    const validPrice = selectValidPrice(prices, enrollmentDate)
    if (!validPrice) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Selected pricing package has no valid price for the enrollment date',
      )
    }
    req.currency = validPrice.currency
    selectedPrice = validPrice
  }

  if (req.billing_cycle) {
    const validCycles = ['monthly', 'quarterly', 'annually', 'one_time']
    if (!validCycles.includes(req.billing_cycle)) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid billing cycle')
    }
  }

  if (req.next_billing_date && req.enrollment_date) {
    const enrollmentDate = new Date(req.enrollment_date)
    const nextBillingDate = new Date(req.next_billing_date)
    if (nextBillingDate <= enrollmentDate) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Next billing date must be after enrollment date')
    }
  }

  const existingActiveEnrollment = await deps.repo.findActiveByStudentAndProgram(
    req.student_id,
    req.program_id,
    req.company_id,
  )

  if (existingActiveEnrollment) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, 'Student is already active in this program')
  }

  if (program.schedules && program.schedules.length > 0) {
    const activeEnrollments = await deps.repo.findActiveByStudent(
      req.student_id,
      req.company_id,
    )
    await deps.checkScheduleConflict(program, activeEnrollments)
  }

  const result = await deps.transactor.withinTransaction(async () => {
    const enrollment = await deps.repo.create(req)

    let invoice = undefined
    if (req.generate_invoice && selectedPrice) {
      const amount = selectedPrice.price
      const invoiceData = await deps.invoiceUsecase.create({
        company_id: req.company_id,
        branch_id: req.branch_id,
        enrollment_id: enrollment.id,
        amount,
        currency: req.currency || 'IDR',
        due_date: req.next_billing_date || req.enrollment_date || new Date(),
        issued_date: new Date(),
        status: 'pending',
        user: req.user,
      })
      invoice = await deps.invoiceUsecase.generatePaymentLink(invoiceData.id, req.company_id)
    }

    return { ...enrollment, latest_invoice: invoice }
  })

  return result
}
