import { PrismaClient } from '@prisma/client'

import { hashPassword } from '../../src/common/encryption'

export async function seedUsers(
  prisma: PrismaClient,
  companyId: string,
  roles: { ownerRoleId: string, superAdminRoleId: string, adminRoleId: string }
) {
  console.log('Creating Users...')
  const password = await hashPassword('password123')

  await prisma.user.create({
    data: {
      name: 'Owner User',
      username: 'owner',
      email: 'owner@tola.solutions',
      password: password,
      roleId: roles.ownerRoleId,
      companyId: companyId,
      status: 'active',
      phone: '081234567890'
    }
  })

  await prisma.user.create({
    data: {
      name: 'Super Admin User',
      username: 'superadmin',
      email: 'superadmin@tola.solutions',
      password: password,
      roleId: roles.superAdminRoleId,
      companyId: companyId,
      status: 'active',
      phone: '081234567891'
    }
  })

  await prisma.user.create({
    data: {
      name: 'Branch Admin User',
      username: 'admin',
      email: 'admin@tola.solutions',
      password: password,
      roleId: roles.adminRoleId,
      companyId: companyId,
      status: 'active',
      phone: '081234567892'
    }
  })

  console.log('Users created')
}
