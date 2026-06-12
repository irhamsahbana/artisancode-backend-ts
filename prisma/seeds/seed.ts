import dotenv from 'dotenv'


import { seedBranches } from './branches'
import { seedCategories } from './categories'
import { clean } from './clean'
import { seedCompanies } from './companies'
import { seedPermissions } from './permissions'
import { seedProducts } from './products'
import { seedCompanyRoles, seedMasterRoles } from './roles'
import { seedStudents } from './students'
import { seedUsers } from './users'
import { disconnect } from '../../src/common/db'

// Load env vars
dotenv.config()

async function main() {
  console.log('Starting seeding...')

  // Clean up
  await clean()

  // 0. Create Permissions
  await seedPermissions()

  // 1. Create Master Roles
  await seedMasterRoles()

  // 2. Create Company
  const company = await seedCompanies()

  // 3. Create Roles
  const { ownerRole, superAdminRole, adminRole } = await seedCompanyRoles(company.id)

  // 4. Create Branch
  const branch = await seedBranches(company.id)

  // 5. Create Users
  await seedUsers(company.id, {
    ownerRoleId: ownerRole.id,
    superAdminRoleId: superAdminRole.id,
    adminRoleId: adminRole.id,
  })

  // 6. Create Categories
  await seedCategories(company.id)

  // 7. Create Students
  await seedStudents(company.id, branch.id)

  // 8. Create Products
  await seedProducts(company.id, branch.id)

  console.log('\n=================================')
  console.log('Seeding completed!')
  console.log('=================================')
  console.log('Credentials:')
  console.log('Owner: owner / password123')
  console.log('Super Admin: superadmin / password123')
  console.log('Branch Admin: admin / password123')
  console.log('=================================\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await disconnect()
  })
