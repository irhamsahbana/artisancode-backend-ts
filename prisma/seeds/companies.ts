import { PrismaClient } from '@prisma/client'

export async function seedCompanies(prisma: PrismaClient) {
  console.log('Creating Company...')
  const company = await prisma.company.create({
    data: {
      name: 'Tola HQ',
      status: 'active',
    }
  })
  
  console.log('Company created')
  return company
}
