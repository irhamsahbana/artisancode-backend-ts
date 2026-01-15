import { PrismaClient } from '@prisma/client'

export async function clean(prisma: PrismaClient) {
  console.log('Cleaning up existing data...')
  
  // Delete in order of dependency (child -> parent)
  await prisma.enrollment.deleteMany()
  await prisma.productPrice.deleteMany()
  await prisma.productPricing.deleteMany()
  await prisma.productSchedule.deleteMany()
  await prisma.teacherProduct.deleteMany()
  await prisma.rolePermission.deleteMany()
  await prisma.student.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()
  await prisma.branch.deleteMany()
  await prisma.role.deleteMany()
  await prisma.permission.deleteMany()
  await prisma.teacher.deleteMany()
  await prisma.company.deleteMany()

  console.log('Cleanup complete')
}
