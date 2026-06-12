import { eq, and, isNull } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { students } from '@/db/schema'
import * as Entity from '@/entities/student.entity'

import { StudentRepoDeps } from '../student.repo'

export async function updateStudent(
  deps: StudentRepoDeps,
  req: Entity.UpdateStudentReq,
): Promise<Entity.Student> {
  const [row] = await getExecutor()
    .update(students)
    .set({
      branchId: req.branch_id,
      firstName: req.first_name,
      lastName: req.last_name,
      gender: req.gender,
      dateOfBirth: req.date_of_birth,
      birthPlace: req.birth_place,
      email: req.email,
      address: req.address,
      photoUrl: req.photo_url,
      parentName: req.parent_name,
      parentPhone: req.parent_phone,
      parentEmail: req.parent_email,
      emergencyContactPhone: req.emergency_contact_phone,
      bloodType: req.blood_type,
      medicalNotes: req.medical_notes,
      status: req.status as Entity.StudentStatus,
    })
    .where(
      and(
        eq(students.id, req.id),
        eq(students.companyId, req.company_id),
        isNull(students.deletedAt),
      ),
    )
    .returning()
  return deps.toEntity(row)
}
