import { db } from '../../src/common/db'
import { categories } from '../../src/db/schema'

export async function seedCategories(companyId: string) {
  console.log('Creating Categories...')
  const [category] = await db
    .insert(categories)
    .values({
      name: 'Kids',
      group: 'Age',
      companyId,
      status: 'active',
    })
    .returning()

  console.log('Categories created')
  return category
}
