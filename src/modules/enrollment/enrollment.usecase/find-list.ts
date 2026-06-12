import * as Entity from '@/entities/enrollment.entity'

import { EnrollmentUsecaseDeps } from '../enrollment.usecase'

export async function findEnrollmentList(
  deps: EnrollmentUsecaseDeps,
  req: Entity.GetEnrollmentReq,
): Promise<Entity.EnrollmentList> {
  return deps.repo.findList(req)
}
