import { db } from '../../src/common/db'
import { productPrices, productPricings, productSchedules, products } from '../../src/db/schema'

export async function seedProducts(companyId: string, branchId: string) {
  console.log('Creating Products...')

  // Create product
  const [product] = await db
    .insert(products)
    .values({
      name: 'Piano Lesson',
      description: 'Basic Piano Lesson for Kids',
      companyId,
      branchId,
      status: 'active',
    })
    .returning()

  // Create pricing
  const [pricing] = await db
    .insert(productPricings)
    .values({
      productId: product.id,
      name: 'Monthly Fee',
      description: 'Monthly tuition fee',
      isActive: true,
    })
    .returning()

  // Create price
  await db.insert(productPrices).values({
    productPricingId: pricing.id,
    price: '500000',
    currency: 'IDR',
  })

  // Create schedules
  await db.insert(productSchedules).values([
    {
      productId: product.id,
      day: 'monday',
      startTime: '14:00',
      endTime: '15:00',
    },
    {
      productId: product.id,
      day: 'thursday',
      startTime: '16:00',
      endTime: '17:00',
    },
  ])

  console.log('Products created')
}
