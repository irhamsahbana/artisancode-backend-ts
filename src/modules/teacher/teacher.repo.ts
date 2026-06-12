import { ITeacherRepo } from '@/contracts/teacher.contract'
import { teachers } from '@/db/schema'
import * as Entity from '@/entities/teacher.entity'

import { createTeacher } from './teacher.repo/create'
import { deleteTeacher } from './teacher.repo/delete'
import { findTeacherByEmail } from './teacher.repo/find-by-email'
import { findTeacherById } from './teacher.repo/find-by-id'
import { findTeacherList } from './teacher.repo/find-list'
import { updateTeacher } from './teacher.repo/update'

// ---------------------------------------------------------------------------
// Shared dependencies for all repo operations
// ---------------------------------------------------------------------------
export interface TeacherRepoDeps {
  toEntity: (
    data: typeof teachers.$inferSelect & { branch?: { id: string; name: string } | null },
  ) => Entity.Teacher
}

function toEntity(
  data: typeof teachers.$inferSelect & { branch?: { id: string; name: string } | null },
): Entity.Teacher {
  return {
    id: data.id,
    company_id: data.companyId,
    branch: data.branch
      ? {
          id: data.branch.id,
          name: data.branch.name,
        }
      : undefined,
    status: data.status,
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    birth_date: data.birthDate,
    biography: data.biography,
    specialty: data.specialty,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
    deleted_at: data.deletedAt,
  }
}

// ---------------------------------------------------------------------------
// Factory — composes individual operations into the ITeacherRepo interface
// ---------------------------------------------------------------------------
export function createTeacherRepo(): ITeacherRepo {
  const deps: TeacherRepoDeps = { toEntity }

  return {
    create: (req) => createTeacher(deps, req),
    update: (req) => updateTeacher(deps, req),
    delete: (id, companyId) => deleteTeacher(id, companyId),
    findById: (id, companyId) => findTeacherById(deps, id, companyId),
    findByEmail: (email) => findTeacherByEmail(deps, email),
    findList: (req) => findTeacherList(deps, req),
  }
}

export default createTeacherRepo
