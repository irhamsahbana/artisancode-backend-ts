import * as Entity from '@/entities/teacher.entity'

import { ITeacherRepo, ITeacherUsecase } from './teacher.contract'

export default class TeacherUsecase implements ITeacherUsecase {
  constructor(private repo: ITeacherRepo) {}

  async create(req: Entity.CreateTeacherReq): Promise<Entity.Teacher> {
    const existing = await this.repo.findByEmail(req.email)
    if (existing) {
      throw new Error('Teacher with this email already exists')
    }
    return this.repo.create(req)
  }

  async update(req: Entity.UpdateTeacherReq): Promise<Entity.Teacher> {
    const teacher = await this.repo.findById(req.id, req.company_id)
    if (!teacher) {
      throw new Error('Teacher not found')
    }

    if (req.email && req.email !== teacher.email) {
      const existing = await this.repo.findByEmail(req.email)
      if (existing) {
        throw new Error('Teacher with this email already exists')
      }
    }

    return this.repo.update(req)
  }

  async delete(id: string, companyId: string): Promise<void> {
    const teacher = await this.repo.findById(id, companyId)
    if (!teacher) {
      throw new Error('Teacher not found')
    }
    return this.repo.delete(id, companyId)
  }

  async findById(id: string, companyId: string): Promise<Entity.Teacher | null> {
    return this.repo.findById(id, companyId)
  }

  async findList(req: Entity.GetTeacherReq): Promise<Entity.TeacherList> {
    return this.repo.findList(req)
  }
}
