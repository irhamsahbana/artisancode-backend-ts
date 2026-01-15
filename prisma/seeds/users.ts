import { PrismaClient } from '@prisma/client'

import { hashPassword } from '../../src/common/encryption'

export async function seedUsers(
  prisma: PrismaClient, 
  companyId: string, 
  roles: { adminRoleId: string, userRoleId: string }
) {
  console.log('Creating Users...')
  const password = await hashPassword('password123')

  await prisma.user.create({
    data: {
      name: 'Super Admin',
      username: 'admin',
      email: 'admin@tola.solutions',
      password: password,
      roleId: roles.adminRoleId,
      companyId: companyId,
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
      roleId: roles.userRoleId,
      companyId: companyId,
      status: 'active',
      phone: '081234567891'
    }
  })

  console.log('Users created')
}
