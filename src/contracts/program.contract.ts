import * as Entity from '@/entities/program.entity'

export interface IProgramRepo {
  create(req: Entity.CreateProgramReq): Promise<Entity.Program>
  update(req: Entity.UpdateProgramReq): Promise<Entity.Program>
  updateAll(req: Entity.UpdateProgramAllReq): Promise<Entity.Program>
  delete(id: string, companyId: string): Promise<void>
  findById(id: string, companyId: string): Promise<Entity.Program | null>
  findByName(
    name: string,
    companyId: string,
    branchId?: string | null,
  ): Promise<Entity.Program | null>
  findList(req: Entity.GetProgramReq): Promise<Entity.ProgramList>
  addSchedule(req: Entity.AddScheduleReq): Promise<Entity.ProgramSchedule>
  addPricing(req: Entity.AddPricingReq): Promise<Entity.ProgramPricing>
  addPrice(req: Entity.AddPriceReq): Promise<Entity.ProgramPrice>
  updatePrice(req: Entity.UpdatePriceReq): Promise<Entity.ProgramPrice>
  deleteSchedule(programId: string, scheduleId: string, companyId: string): Promise<void>
  deletePricing(programId: string, pricingId: string, companyId: string): Promise<void>
}

export interface IProgramUsecase {
  create(req: Entity.CreateProgramReq): Promise<Entity.Program>
  update(req: Entity.UpdateProgramReq): Promise<Entity.Program>
  updateAll(req: Entity.UpdateProgramAllReq): Promise<Entity.Program>
  delete(id: string, companyId: string): Promise<void>
  findById(id: string, companyId: string): Promise<Entity.Program | null>
  findList(req: Entity.GetProgramReq): Promise<Entity.ProgramList>
  addSchedule(req: Entity.AddScheduleReq): Promise<Entity.ProgramSchedule>
  addPricing(req: Entity.AddPricingReq): Promise<Entity.ProgramPricing>
  addPrice(req: Entity.AddPriceReq): Promise<Entity.ProgramPrice>
  updatePrice(req: Entity.UpdatePriceReq): Promise<Entity.ProgramPrice>
  deleteSchedule(programId: string, scheduleId: string, companyId: string): Promise<void>
  deletePricing(programId: string, pricingId: string, companyId: string): Promise<void>
}
