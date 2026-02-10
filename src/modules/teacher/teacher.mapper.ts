import { Teacher } from '@prisma/client'

import * as Entity from '@/entities/teacher.entity'

export type TeacherWithBranch = Teacher & {
  branch?: {
    id: string
    name: string
  } | null
}

export const toTeacherEntity = (data: TeacherWithBranch): Entity.Teacher => ({
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
})
