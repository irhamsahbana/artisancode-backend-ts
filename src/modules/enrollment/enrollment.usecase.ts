import { AppError } from '@/common/app_error'
import { selectValidPrice } from '@/common/utils/select_valid_price'
import * as Entity from '@/entities/enrollment.entity'
import { Program, ProgramStatuses } from '@/entities/program.entity'
import { InactiveStudentStatuses, StudentStatus } from '@/entities/student.entity'
import { IBranchRepo } from '@/modules/branch/branch.contract'
import { IProgramRepo } from '@/modules/program/program.contract'
import { IStudentRepo } from '@/modules/student/student.contract'

import { IEnrollmentRepo, IEnrollmentUsecase } from './enrollment.contract'

export default class EnrollmentUsecase implements IEnrollmentUsecase {
  constructor(
    private repo: IEnrollmentRepo,
    private branchRepo: IBranchRepo,
    private studentRepo: IStudentRepo,
    private programRepo: IProgramRepo,
  ) {}

  async create(req: Entity.CreateEnrollmentReq): Promise<Entity.Enrollment> {
    const branch = await this.branchRepo.findById(req.branch_id, req.company_id)
    if (!branch) {
      throw new AppError(404, 'Branch not found')
    }

    const student = await this.studentRepo.findById(req.student_id, req.company_id)
    if (!student) {
      throw new AppError(404, 'Student not found')
    }

    if (InactiveStudentStatuses.includes(student.status as StudentStatus)) {
      throw new AppError(400, 'Student is not active')
    }

    // Edge case: Student belongs to a different branch
    if (student.branch_id !== req.branch_id) {
      throw new AppError(400, 'Student belongs to a different branch')
    }

    const program = await this.programRepo.findById(req.program_id, req.company_id)
    if (!program) {
      throw new AppError(404, 'Program not found')
    }

    // Centralized program status check
    if (!ProgramStatuses.includes(program.status) || program.status !== 'active') {
      throw new AppError(400, 'Program is not active')
    }

    if (program.branch_id && program.branch_id !== req.branch_id) {
      throw new AppError(400, 'Program is not available in this branch')
    }

    if (program.capacity) {
      const activeEnrollments = await this.repo.countActiveByProgram(req.program_id, req.company_id)
      if (activeEnrollments >= program.capacity) {
        throw new AppError(400, 'Program capacity reached')
      }
    }

    const pricing = program.pricings?.find((p) => p.id === req.pricing_id)
    if (!pricing) {
      throw new AppError(400, 'Invalid pricing for this program')
    }

    if (!pricing.is_active) {
      throw new AppError(400, 'Selected pricing is not active')
    }

    // Validate that the pricing package has a valid price for the enrollment date.
    // Since pricing can change over time (e.g. price increase in 2025), we must ensure
    // that there is a price configuration that covers the specific enrollment date.
    // A price is valid if:
    // 1. It started BEFORE or ON the enrollment date (start <= enrollmentDate)
    // 2. It has NOT ended yet, OR it ends AFTER or ON the enrollment date (end == null || end >= enrollmentDate)
    const enrollmentDate = req.enrollment_date ? new Date(req.enrollment_date) : new Date()
    const validPrice = selectValidPrice(pricing.prices, enrollmentDate)

    if (!validPrice) {
      throw new AppError(400, 'Selected pricing package has no valid price for the enrollment date')
    }

    if (req.billing_cycle) {
      const validCycles = ['monthly', 'quarterly', 'annually', 'one_time']
      if (!validCycles.includes(req.billing_cycle)) {
        throw new AppError(400, 'Invalid billing cycle')
      }
    }

    if (req.next_billing_date && req.enrollment_date) {
      const enrollmentDate = new Date(req.enrollment_date)
      const nextBillingDate = new Date(req.next_billing_date)
      if (nextBillingDate <= enrollmentDate) {
        throw new AppError(400, 'Next billing date must be after enrollment date')
      }
    }

    // Check for active enrollment (duplicate check)
    const existingActiveEnrollment = await this.repo.findActiveByStudentAndProgram(
      req.student_id,
      req.program_id,
      req.company_id,
    )

    if (existingActiveEnrollment) {
      throw new AppError(400, 'Student is already active in this program')
    }

    // Check for schedule conflicts
    if (program.schedules && program.schedules.length > 0) {
      const activeEnrollments = await this.repo.findActiveByStudent(req.student_id, req.company_id)
      this.checkScheduleConflict(program, activeEnrollments)
    }

    return this.repo.create(req)
  }

  private checkScheduleConflict(newProgram: Program, existingEnrollments: Entity.Enrollment[]) {
    if (!newProgram.schedules || newProgram.schedules.length === 0) return

    for (const enrollment of existingEnrollments) {
      const existingProgram = enrollment.program
      if (!existingProgram || !existingProgram.schedules || existingProgram.schedules.length === 0)
        continue

      for (const newSchedule of newProgram.schedules) {
        for (const existingSchedule of existingProgram.schedules) {
          if (newSchedule.day === existingSchedule.day) {
            // Simple time overlap check assuming HH:mm format
            if (
              newSchedule.start_time < existingSchedule.end_time &&
              newSchedule.end_time > existingSchedule.start_time
            ) {
              throw new AppError(
                409,
                `Schedule conflict with existing program: ${existingProgram.name} on ${newSchedule.day} (${existingSchedule.start_time} - ${existingSchedule.end_time})`,
              )
            }
          }
        }
      }
    }
  }

  async update(req: Entity.UpdateEnrollmentReq): Promise<Entity.Enrollment> {
    const enrollment = await this.repo.findById(req.id, req.company_id)
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
      const branch = await this.branchRepo.findById(req.branch_id, req.company_id)
      if (!branch) {
        throw new AppError(404, 'Branch not found')
      }
    }

    let student = null
    if (req.student_id || effectiveStatus === 'active') {
      student = await this.studentRepo.findById(effectiveStudentId, req.company_id)
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
      program = await this.programRepo.findById(effectiveProgramId, req.company_id)
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
        const activeEnrollments = await this.repo.countActiveByProgram(
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

    if (req.pricing_id || req.program_id || req.enrollment_date) {
      const programData = await resolveProgram()
      const pricingId = req.pricing_id ?? enrollment.pricing_id
      const pricing = programData.pricings?.find((p) => p.id === pricingId)
      if (!pricing) {
        throw new AppError(400, 'Invalid pricing for this program')
      }
      if (!pricing.is_active) {
        throw new AppError(400, 'Selected pricing is not active')
      }
      const validPrice = selectValidPrice(pricing.prices, effectiveEnrollmentDate)
      if (!validPrice) {
        throw new AppError(400, 'Selected pricing package has no valid price for the enrollment date')
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
      const existingActiveEnrollment = await this.repo.findActiveByStudentAndProgram(
        effectiveStudentId,
        effectiveProgramId,
        req.company_id,
      )

      if (existingActiveEnrollment && existingActiveEnrollment.id !== enrollment.id) {
        throw new AppError(400, 'Student is already active in this program')
      }

      const programData = await resolveProgram()
      if (programData.schedules && programData.schedules.length > 0) {
        const activeEnrollments = await this.repo.findActiveByStudent(
          effectiveStudentId,
          req.company_id,
        )
        const filteredEnrollments = activeEnrollments.filter((item) => item.id !== enrollment.id)
        this.checkScheduleConflict(programData, filteredEnrollments)
      }
    }

    return this.repo.update(req)
  }

  async delete(id: string, companyId: string): Promise<void> {
    const enrollment = await this.repo.findById(id, companyId)
    if (!enrollment) {
      throw new AppError(404, 'Enrollment not found')
    }
    return this.repo.delete(id, companyId)
  }

  async findById(id: string, companyId: string): Promise<Entity.Enrollment | null> {
    return this.repo.findById(id, companyId)
  }

  async findList(req: Entity.GetEnrollmentReq): Promise<Entity.EnrollmentList> {
    return this.repo.findList(req)
  }
}
