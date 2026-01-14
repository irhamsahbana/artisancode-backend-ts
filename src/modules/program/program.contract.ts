import * as Entity from '@/entities/program.entity'

export interface IProgramRepo {
  create(req: Entity.CreateProgramReq): Promise<Entity.Program>
  update(req: Entity.UpdateProgramReq): Promise<Entity.Program>
  delete(id: string, companyId: string): Promise<void>
  findById(id: string, companyId: string): Promise<Entity.Program | null>
  findList(req: Entity.GetProgramReq): Promise<Entity.ProgramList>
}

export interface IProgramUsecase {
  create(req: Entity.CreateProgramReq): Promise<Entity.Program>
  update(req: Entity.UpdateProgramReq): Promise<Entity.Program>
  delete(id: string, companyId: string): Promise<void>
  findById(id: string, companyId: string): Promise<Entity.Program | null>
  findList(req: Entity.GetProgramReq): Promise<Entity.ProgramList>
}
