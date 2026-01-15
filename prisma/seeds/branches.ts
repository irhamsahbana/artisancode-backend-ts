import { PrismaClient } from '@prisma/client'

export async function seedBranches(prisma: PrismaClient, companyId: string) {
  console.log('Creating Branch...')
  const branch = await prisma.branch.create({
    data: {
      name: 'Jakarta Branch',
      city: 'Jakarta',
      companyId: companyId,
      status: 'active',
      address: 'Jl. Jenderal Sudirman',
      phone: '021-12345678',
      email: 'jakarta@tola.solutions',
      capacity: 100,
      description: 'Main Office Branch'
    }
  })

  console.log('Branch created')
  return branch
}
