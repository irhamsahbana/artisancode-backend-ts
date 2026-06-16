import { AppError, ErrorCode } from '@/common/packages/types'
import * as Entity from '@/entities/enrollment.entity'
import { Program } from '@/entities/program.entity'

import { EnrollmentUsecaseDeps } from '../enrollment.usecase'

export async function checkScheduleConflict(
  deps: EnrollmentUsecaseDeps,
  newProgram: Program,
  existingEnrollments: Entity.Enrollment[],
): Promise<void> {
  if (!newProgram.schedules || newProgram.schedules.length === 0) return

  for (const enrollment of existingEnrollments) {
    const existingProgram = enrollment.program
    if (
      !existingProgram ||
      !existingProgram.schedules ||
      existingProgram.schedules.length === 0
    )
      continue

    for (const newSchedule of newProgram.schedules) {
      for (const existingSchedule of existingProgram.schedules) {
        if (newSchedule.day === existingSchedule.day) {
          if (
            newSchedule.start_time < existingSchedule.end_time &&
            newSchedule.end_time > existingSchedule.start_time
          ) {
            throw new AppError(
              ErrorCode.CONFLICT,
              `Schedule conflict with existing program: ${existingProgram.name} on ${newSchedule.day} (${existingSchedule.start_time} - ${existingSchedule.end_time})`,
            )
          }
        }
      }
    }
  }
}
