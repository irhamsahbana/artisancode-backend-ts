import { eq, and, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { branches, teachers } from '@/db/schema'
import * as Entity from '@/entities/teacher.entity'

import { TeacherRepoDeps } from '../teacher.repo'

export async function findTeacherById(
  deps: TeacherRepoDeps,
  id: string,
  companyId: string,
): Promise<Entity.Teacher | null> {
  const [row] = await getExecutor()
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
    .where(
      and(eq(teachers.id, id), eq(teachers.companyId, companyId), isNull(teachers.deletedAt)),
    )
    .limit(1)

  return row ? deps.toEntity(row) : null
}
