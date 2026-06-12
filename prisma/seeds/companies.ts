import { db } from '../../src/common/db'
import { companies } from '../../src/db/schema'

export async function seedCompanies() {
  console.log('Creating Company...')
  const [company] = await db
    .insert(companies)
    .values({
      name: 'Tola HQ',
      status: 'active',
    })
    .returning()

  console.log('Company created')
  return company
}
