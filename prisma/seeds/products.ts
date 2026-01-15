import { PrismaClient } from '@prisma/client'

export async function seedProducts(
  prisma: PrismaClient, 
  companyId: string, 
  branchId: string, 
  categoryId: string
) {
  console.log('Creating Products...')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const product = await prisma.product.create({
    data: {
      name: 'Piano Lesson',
      description: 'Basic Piano Lesson for Kids',
      companyId: companyId,
      branchId: branchId,
      ageCategoryId: categoryId,
      status: 'active',
      pricings: {
        create: {
          name: 'Monthly Fee',
          description: 'Monthly tuition fee',
          isActive: true,
          prices: {
            create: {
              price: 500000,
              currency: 'IDR',
              isActive: true,
            },
          },
        },
      },
      productSchedules: {
        create: [
          {
            day: 'monday',
            startTime: '14:00',
            endTime: '15:00',
          },
          {
            day: 'thursday',
            startTime: '16:00',
            endTime: '17:00',
          },
        ],
      },
    },
  })
  console.log('Products created')
}
