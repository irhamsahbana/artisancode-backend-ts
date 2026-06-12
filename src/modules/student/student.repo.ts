import { IStudentRepo } from '@/contracts/student.contract'
import { students } from '@/db/schema'
import * as Entity from '@/entities/student.entity'

import { createStudent } from './student.repo/create'
import { deleteStudent } from './student.repo/delete'
import { findStudentByEmail } from './student.repo/find-by-email'
import { findStudentById } from './student.repo/find-by-id'
import { findStudentList } from './student.repo/find-list'
import { updateStudent } from './student.repo/update'

export interface StudentRepoDeps {
  toEntity: (data: typeof students.$inferSelect) => Entity.Student
}

function toEntity(data: typeof students.$inferSelect): Entity.Student {
  return {
    id: data.id,
    company_id: data.companyId,
    branch_id: data.branchId,
    first_name: data.firstName,
    last_name: data.lastName,
    gender: data.gender,
    date_of_birth: data.dateOfBirth,
    birth_place: data.birthPlace,
    email: data.email,
    address: data.address,
    photo_url: data.photoUrl,
    parent_name: data.parentName,
    parent_phone: data.parentPhone,
    parent_email: data.parentEmail,
    emergency_contact_phone: data.emergencyContactPhone,
    blood_type: data.bloodType,
    medical_notes: data.medicalNotes,
    status: data.status,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
    deleted_at: data.deletedAt,
  }
}

export function createStudentRepo(): IStudentRepo {
  const deps: StudentRepoDeps = { toEntity }

  return {
    create: (req) => createStudent(deps, req),
    update: (req) => updateStudent(deps, req),
    delete: (id, companyId) => deleteStudent(id, companyId),
    findById: (id, companyId) => findStudentById(deps, id, companyId),
    findByEmail: (email) => findStudentByEmail(deps, email),
    findList: (req) => findStudentList(deps, req),
  }
}

export default createStudentRepo
