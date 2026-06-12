import { eq, and, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { branches, teachers } from '@/db/schema'
import * as Entity from '@/entities/teacher.entity'

import { TeacherRepoDeps } from '../teacher.repo'

export async function updateTeacher(deps: TeacherRepoDeps, req: Entity.UpdateTeacherReq): Promise<Entity.Teacher> {
  const [row] = await getExecutor()
    .update(teachers)
    .set({
      branchId: req.branch_id,
      status: req.status,
      name: req.name,
      email: req.email,
      phone: req.phone,
      address: req.address,
      birthDate: req.birth_date,
      biography: req.biography,
      specialty: req.specialty,
    })
    .where(
      and(
        eq(teachers.id, req.id),
        eq(teachers.companyId, req.company_id),
        isNull(teachers.deletedAt),
      ),
    )
    .returning()

  const [withBranch] = await getExecutor()
    .select({
      id: teachers.id,
      companyId: teachers.companyId,
      branchId: teachers.branchId,
      status: teachers.status,
      name: teachers.name,
      email: teachers.email,
      phone: teachers.phone,
      address: teachers.address,
      birthDate: teachers.birthDate,
      biography: teachers.biography,
      specialty: teachers.specialty,
      createdAt: teachers.createdAt,
      updatedAt: teachers.updatedAt,
      deletedAt: teachers.deletedAt,
      branch: {
        id: branches.id,
        name: branches.name,
      },
    })
    .from(teachers)
    .leftJoin(branches, eq(teachers.branchId, branches.id))
    .where(eq(teachers.id, row.id))
    .limit(1)

  return deps.toEntity(withBranch)
}
