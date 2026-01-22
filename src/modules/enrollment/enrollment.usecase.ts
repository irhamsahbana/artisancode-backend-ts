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

    if (req.branch_id) {
      const branch = await this.branchRepo.findById(req.branch_id, req.company_id)
      if (!branch) {
        throw new AppError(404, 'Branch not found')
      }
    }

    if (req.student_id) {
      const student = await this.studentRepo.findById(req.student_id, req.company_id)
      if (!student) {
        throw new AppError(404, 'Student not found')
      }
    }

    if (req.program_id) {
      const program = await this.programRepo.findById(req.program_id, req.company_id)
      if (!program) {
        throw new AppError(404, 'Program not found')
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
