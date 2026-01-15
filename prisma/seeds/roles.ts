import { PrismaClient } from '@prisma/client'

export async function seedRoles(prisma: PrismaClient, companyId: string) {
  console.log('Creating Roles...')
  const adminRole = await prisma.role.create({
    data: {
      name: 'Admin',
      description: 'Administrator role with full access',
      companyId: companyId,
    }
  })

  const userRole = await prisma.role.create({
    data: {
      name: 'User',
      description: 'Regular user role',
      companyId: companyId,
    }
  })

  console.log('Roles created')
  
  return {
    adminRole,
    userRole
  }
}
