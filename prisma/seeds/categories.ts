import { PrismaClient } from '@prisma/client'

export async function seedCategories(prisma: PrismaClient, companyId: string) {
  console.log('Creating Categories...')
  const category = await prisma.category.create({
    data: {
      name: 'Kids',
      group: 'Age',
      companyId: companyId,
      status: 'active'
    }
  })
  console.log('Categories created')
  return category
}
