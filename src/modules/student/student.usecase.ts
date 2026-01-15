import { AppError } from '@/common/app_error'
import * as Entity from '@/entities/student.entity'
import { IBranchRepo } from '@/modules/branch/branch.contract'

import { IStudentRepo, IStudentUsecase } from './student.contract'

export default class StudentUsecase implements IStudentUsecase {
  constructor(
    private repo: IStudentRepo,
    private branchRepo: IBranchRepo,
  ) {}

  async create(req: Entity.CreateStudentReq): Promise<Entity.Student> {
    const branch = await this.branchRepo.findById(req.branch_id, req.company_id)
    if (!branch) {
      throw new AppError(404, 'Branch not found')
    }

    return this.repo.create(req)
  }

  async update(req: Entity.UpdateStudentReq): Promise<Entity.Student> {
    const student = await this.repo.findById(req.id, req.company_id)
    if (!student) {
      throw new AppError(404, 'Student not found')
    }

    if (req.branch_id) {
      const branch = await this.branchRepo.findById(req.branch_id, req.company_id)
      if (!branch) {
        throw new AppError(404, 'Branch not found')
      }
    }

    return this.repo.update(req)
  }

  async delete(id: string, companyId: string): Promise<void> {
    const student = await this.repo.findById(id, companyId)
    if (!student) {
      throw new AppError(404, 'Student not found')
    }
    return this.repo.delete(id, companyId)
  }

  async findById(id: string, companyId: string): Promise<Entity.Student | null> {
    return this.repo.findById(id, companyId)
  }

  async findList(req: Entity.GetStudentReq): Promise<Entity.StudentList> {
    return this.repo.findList(req)
  }
}
