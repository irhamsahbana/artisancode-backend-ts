import * as Entity from '@/entities/activity_log.entity'

export interface IActivityLogRepo {
  create(req: Entity.CreateActivityLogReq): Promise<Entity.ActivityLog>
  findById(id: string, companyId: string): Promise<Entity.ActivityLog | null>
  findList(req: Entity.GetActivityLogReq): Promise<Entity.ActivityLogList>
}

export interface IActivityLogUsecase {
  create(req: Entity.CreateActivityLogReq): Promise<Entity.ActivityLog>
  findById(id: string, companyId: string): Promise<Entity.ActivityLog | null>
  findList(req: Entity.GetActivityLogReq): Promise<Entity.ActivityLogList>
}
