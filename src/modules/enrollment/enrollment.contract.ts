import * as Entity from '@/entities/enrollment.entity'

export interface IEnrollmentRepo {
  create(req: Entity.CreateEnrollmentReq): Promise<Entity.Enrollment>
  update(req: Entity.UpdateEnrollmentReq): Promise<Entity.Enrollment>
  delete(id: string, companyId: string): Promise<void>
  findById(id: string, companyId: string): Promise<Entity.Enrollment | null>
  findList(req: Entity.GetEnrollmentReq): Promise<Entity.EnrollmentList>
}

export interface IEnrollmentUsecase {
  create(req: Entity.CreateEnrollmentReq): Promise<Entity.Enrollment>
  update(req: Entity.UpdateEnrollmentReq): Promise<Entity.Enrollment>
  delete(id: string, companyId: string): Promise<void>
  findById(id: string, companyId: string): Promise<Entity.Enrollment | null>
  findList(req: Entity.GetEnrollmentReq): Promise<Entity.EnrollmentList>
}
