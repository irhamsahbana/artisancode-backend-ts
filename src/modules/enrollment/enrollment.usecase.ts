import { AppError } from '@/common/app_error'
import * as Entity from '@/entities/enrollment.entity'
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

    const program = await this.programRepo.findById(req.program_id, req.company_id)
    if (!program) {
      throw new AppError(404, 'Program not found')
    }

    return this.repo.create(req)
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
