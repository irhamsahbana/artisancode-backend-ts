import { db } from '../../src/common/db'
import { branches } from '../../src/db/schema'

export async function seedBranches(companyId: string) {
  console.log('Creating Branch...')
  const [branch] = await db
    .insert(branches)
    .values({
      name: 'Jakarta Branch',
      city: 'Jakarta',
      companyId,
      status: 'active',
      address: 'Jl. Jenderal Sudirman',
      phone: '021-12345678',
      email: 'jakarta@tola.solutions',
      capacity: 100,
      description: 'Main Office Branch',
    })
    .returning()

  console.log('Branch created')
  return branch
}
