import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import { Pool } from 'pg'

import { seedBranches } from './branches'
import { seedCategories } from './categories'
import { clean } from './clean'
import { seedCompanies } from './companies'
import { seedPermissions } from './permissions'
import { seedProducts } from './products'
import { seedCompanyRoles, seedMasterRoles } from './roles'
import { seedStudents } from './students'
import { seedUsers } from './users'

// Load env vars
dotenv.config()

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Starting seeding...')

  // Clean up
  await clean(prisma)

  // 0. Create Permissions
  await seedPermissions(prisma)

  // 1. Create Master Roles
  await seedMasterRoles(prisma)

  // 2. Create Company
  const company = await seedCompanies(prisma)

  // 3. Create Roles
  const { ownerRole, superAdminRole, adminRole } = await seedCompanyRoles(prisma, company.id)

  // 4. Create Branch
  const branch = await seedBranches(prisma, company.id)

  // 4. Create Users
  await seedUsers(prisma, company.id, {
    ownerRoleId: ownerRole.id,
    superAdminRoleId: superAdminRole.id,
    adminRoleId: adminRole.id,
  })

  // 5. Create Categories
  const category = await seedCategories(prisma, company.id)

  // 6. Create Students
  await seedStudents(prisma, company.id, branch.id)

  // 7. Create Products
  await seedProducts(prisma, company.id, branch.id, category.id)

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
    await prisma.$disconnect()
  })
