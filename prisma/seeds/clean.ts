import { db } from '../../src/common/db'
import {
  branches,
  categories,
  companies,
  enrollments,
  invoices,
  payments,
  permissions,
  productPrices,
  productPricings,
  productSchedules,
  products,
  rolePermissions,
  roles,
  students,
  teacherProducts,
  teachers,
  users,
} from '../../src/db/schema'

export async function clean() {
  console.log('Cleaning up existing data...')

  // Delete in order of dependency (child -> parent)
  await db.delete(payments)
  await db.delete(invoices)
  await db.delete(enrollments)
  await db.delete(productPrices)
  await db.delete(productPricings)
  await db.delete(productSchedules)
  await db.delete(teacherProducts)
  await db.delete(rolePermissions)
  await db.delete(students)
  await db.delete(products)
  await db.delete(categories)
  await db.delete(users)
  await db.delete(branches)
  await db.delete(roles)
  await db.delete(permissions)
  await db.delete(teachers)
  await db.delete(companies)

  console.log('Cleanup complete')
}
