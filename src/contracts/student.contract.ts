import { IBranchRepo } from '@/contracts/branch.contract'
import * as Entity from '@/entities/student.entity'

export interface IStudentRepo {
  create(req: Entity.CreateStudentReq): Promise<Entity.Student>
  update(req: Entity.UpdateStudentReq): Promise<Entity.Student>
  delete(id: string, companyId: string): Promise<void>
  findById(id: string, companyId: string): Promise<Entity.Student | null>
  findList(req: Entity.GetStudentReq): Promise<Entity.StudentList>
  findByEmail(email: string): Promise<Entity.Student | null>
}

export interface IStudentUsecase {
  create(req: Entity.CreateStudentReq): Promise<Entity.Student>
  update(req: Entity.UpdateStudentReq): Promise<Entity.Student>
  delete(id: string, companyId: string): Promise<void>
  findById(id: string, companyId: string): Promise<Entity.Student | null>
  findList(req: Entity.GetStudentReq): Promise<Entity.StudentList>
}

export interface StudentUsecaseDeps {
  repo: IStudentRepo
  branchRepo: IBranchRepo
}
