import * as Entity from '@/entities/teacher.entity'

export interface ITeacherRepo {
  create(req: Entity.CreateTeacherReq): Promise<Entity.Teacher>
  update(req: Entity.UpdateTeacherReq): Promise<Entity.Teacher>
  delete(id: string, companyId: string): Promise<void>
  findById(id: string, companyId: string): Promise<Entity.Teacher | null>
  findList(req: Entity.GetTeacherReq): Promise<Entity.TeacherList>
  findByEmail(email: string): Promise<Entity.Teacher | null>
}

export interface ITeacherUsecase {
  create(req: Entity.CreateTeacherReq): Promise<Entity.Teacher>
  update(req: Entity.UpdateTeacherReq): Promise<Entity.Teacher>
  delete(id: string, companyId: string): Promise<void>
  findById(id: string, companyId: string): Promise<Entity.Teacher | null>
  findList(req: Entity.GetTeacherReq): Promise<Entity.TeacherList>
}
