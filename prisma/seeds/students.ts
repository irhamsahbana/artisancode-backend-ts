import { PrismaClient } from '@prisma/client'

export async function seedStudents(
  prisma: PrismaClient,
  companyId: string,
  branchId: string
) {
  console.log('Creating Students...')
  await prisma.student.create({
    data: {
      firstName: 'Budi',
      lastName: 'Santoso',
      email: 'budi.santoso@example.com',
      companyId: companyId,
      branchId: branchId,
      gender: 'Male',
      dateOfBirth: new Date('2015-05-20'),
      birthPlace: 'Jakarta',
      address: 'Jl. Merdeka No. 10',
      photoUrl: 'https://placehold.co/400',
      parentName: 'Agus Santoso',
      parentPhone: '081234567892',
      parentEmail: 'agus.santoso@example.com',
      emergencyContactPhone: '081234567892',
      status: 'active'
    }
  })

  await prisma.student.create({
    data: {
      firstName: 'Siti',
      lastName: 'Aminah',
      email: 'siti.aminah@example.com',
      companyId: companyId,
      branchId: branchId,
      gender: 'Female',
      dateOfBirth: new Date('2016-08-15'),
      birthPlace: 'Bandung',
      address: 'Jl. Dago No. 5',
      photoUrl: 'https://placehold.co/400',
      parentName: 'Rina Aminah',
      parentPhone: '081234567893',
      parentEmail: 'rina.aminah@example.com',
      emergencyContactPhone: '081234567893',
      status: 'active'
    }
  })
  console.log('Students created')
}
