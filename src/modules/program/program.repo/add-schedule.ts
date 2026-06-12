import { getExecutor } from '@/common/executor'
import { productSchedules as productSchedulesTable } from '@/db/schema'
import * as Entity from '@/entities/program.entity'

export async function addSchedule(req: Entity.AddScheduleReq): Promise<Entity.ProgramSchedule> {
  const [row] = await getExecutor()
    .insert(productSchedulesTable)
    .values({
      productId: req.program_id,
      day: req.day || '',
      startTime: req.start_time || '',
      endTime: req.end_time || '',
    })
    .returning()

  return {
    id: row.id,
    program_id: row.productId,
    day: row.day,
    start_time: row.startTime,
    end_time: row.endTime,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  }
}
