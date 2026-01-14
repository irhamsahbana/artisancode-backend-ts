import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import { Pool } from 'pg'

// Load env vars
dotenv.config()

// Import from src using relative path to be safe, though tsconfig-paths should work
import { hashPassword } from '../src/common/encryption'

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
  console.log('Cleaning up existing data...')
  // Delete in order of dependency (child -> parent)
  await prisma.enrollment.deleteMany()
  await prisma.productPrice.deleteMany()
  await prisma.productPricing.deleteMany()
  await prisma.productSchedule.deleteMany()
  await prisma.teacherProduct.deleteMany()
  await prisma.rolePermission.deleteMany()
  await prisma.student.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()
  await prisma.branch.deleteMany()
  await prisma.role.deleteMany()
  await prisma.permission.deleteMany()
  await prisma.teacher.deleteMany()
  await prisma.company.deleteMany()

  console.log('Cleanup complete')

  // 1. Create Company
  console.log('Creating Company...')
  const company = await prisma.company.create({
    data: {
      name: 'Tola HQ',
      status: 'active',
    }
  })
  
  console.log('Company created')

  // 2. Create Roles
  console.log('Creating Roles...')
  const adminRole = await prisma.role.create({
    data: {
      name: 'Admin',
      description: 'Administrator role with full access',
      companyId: company.id,
    }
  })

  const userRole = await prisma.role.create({
    data: {
      name: 'User',
      description: 'Regular user role',
      companyId: company.id,
    }
  })

  console.log('Roles created')

  // 3. Create Branch
  console.log('Creating Branch...')
  const branch = await prisma.branch.create({
    data: {
      name: 'Jakarta Branch',
      city: 'Jakarta',
      companyId: company.id,
      status: 'active',
      address: 'Jl. Jenderal Sudirman',
      phone: '021-12345678',
      email: 'jakarta@tola.solutions',
      capacity: 100,
      description: 'Main Office Branch'
    }
  })
  
  console.log('Branch created')

  // 4. Create Users
  console.log('Creating Users...')
  const password = await hashPassword('password123')

  await prisma.user.create({
    data: {
      name: 'Super Admin',
      username: 'admin',
      email: 'admin@tola.solutions',
      password: password,
      roleId: adminRole.id,
      companyId: company.id,
      status: 'active',
      phone: '081234567890'
    }
  })

  await prisma.user.create({
    data: {
      name: 'Regular User',
      username: 'user',
      email: 'user@tola.solutions',
      password: password,
      roleId: userRole.id,
      companyId: company.id,
      status: 'active',
      phone: '081234567891'
    }
  })

  console.log('Users created')

  // 5. Create Categories
  console.log('Creating Categories...')
  const category = await prisma.category.create({
    data: {
      name: 'Kids',
      group: 'Age',
      companyId: company.id,
      status: 'active'
    }
  })
  console.log('Categories created')

  // 6. Create Students
  console.log('Creating Students...')
  await prisma.student.create({
    data: {
      firstName: 'Budi',
      lastName: 'Santoso',
      email: 'budi.santoso@example.com',
      companyId: company.id,
      branchId: branch.id,
      ageCategoryId: category.id,
      gender: 'Male',
      dateOfBirth: new Date('2015-05-20'),
      birthPlace: 'Jakarta',
      address: 'Jl. Merdeka No. 10',
      photoUrl: 'https://placehold.co/400',
      parentName: 'Agus Santoso',
      parentPhone: '081234567892',
      parentEmail: 'agus.santoso@example.com',
      emergencyContactPhone: '081234567892',
      status: 'active'
    }
  })

  await prisma.student.create({
    data: {
      firstName: 'Siti',
      lastName: 'Aminah',
      email: 'siti.aminah@example.com',
      companyId: company.id,
      branchId: branch.id,
      ageCategoryId: category.id,
      gender: 'Female',
      dateOfBirth: new Date('2016-08-15'),
      birthPlace: 'Bandung',
      address: 'Jl. Dago No. 5',
      photoUrl: 'https://placehold.co/400',
      parentName: 'Rina Aminah',
      parentPhone: '081234567893',
      parentEmail: 'rina.aminah@example.com',
      emergencyContactPhone: '081234567893',
      status: 'active'
    }
  })
  console.log('Students created')

  // 7. Create Products
  console.log('Creating Products...')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const product = await prisma.product.create({
    data: {
      name: 'Piano Lesson',
      description: 'Basic Piano Lesson for Kids',
      companyId: company.id,
      branchId: branch.id,
      ageCategoryId: category.id,
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
  
  console.log('\n=================================')
  console.log('Seeding completed!')
  console.log('=================================')
  console.log('Credentials:')
  console.log('Admin: admin / password123')
  console.log('User: user / password123')
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
