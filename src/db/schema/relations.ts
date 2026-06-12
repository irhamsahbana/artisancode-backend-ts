import { relations } from 'drizzle-orm'

import {
  activityLogs,
  branches,
  categories,
  companies,
  enrollments,
  invoices,
  payments,
  permissions,
  productPricings,
  productPrices,
  productSchedules,
  products,
  rolePermissions,
  roles,
  students,
  teacherProducts,
  teachers,
  users,
} from './tables'

// ---------------------------------------------------------------------------
// Company
// ---------------------------------------------------------------------------
export const companiesRelations = relations(companies, ({ many }) => ({
  branches: many(branches),
  categories: many(categories),
  users: many(users),
  roles: many(roles),
  products: many(products),
  teachers: many(teachers),
  students: many(students),
  enrollments: many(enrollments),
  invoices: many(invoices),
  payments: many(payments),
  activityLogs: many(activityLogs),
}))

// ---------------------------------------------------------------------------
// Branch
// ---------------------------------------------------------------------------
export const branchesRelations = relations(branches, ({ one, many }) => ({
  company: one(companies, { fields: [branches.companyId], references: [companies.id] }),
  users: many(users),
  products: many(products),
  teachers: many(teachers),
  students: many(students),
  enrollments: many(enrollments),
  invoices: many(invoices),
  payments: many(payments),
  activityLogs: many(activityLogs),
}))

// ---------------------------------------------------------------------------
// Role
// ---------------------------------------------------------------------------
export const rolesRelations = relations(roles, ({ one, many }) => ({
  company: one(companies, { fields: [roles.companyId], references: [companies.id] }),
  users: many(users),
  rolePermissions: many(rolePermissions),
}))

// ---------------------------------------------------------------------------
// Permission
// ---------------------------------------------------------------------------
export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}))

// ---------------------------------------------------------------------------
// RolePermission
// ---------------------------------------------------------------------------
export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, { fields: [rolePermissions.roleId], references: [roles.id] }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}))

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------
export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, { fields: [users.companyId], references: [companies.id] }),
  branch: one(branches, { fields: [users.branchId], references: [branches.id] }),
  role: one(roles, { fields: [users.roleId], references: [roles.id] }),
  activityLogs: many(activityLogs),
}))

// ---------------------------------------------------------------------------
// Student
// ---------------------------------------------------------------------------
export const studentsRelations = relations(students, ({ one, many }) => ({
  company: one(companies, { fields: [students.companyId], references: [companies.id] }),
  branch: one(branches, { fields: [students.branchId], references: [branches.id] }),
  enrollments: many(enrollments),
}))

// ---------------------------------------------------------------------------
// Teacher
// ---------------------------------------------------------------------------
export const teachersRelations = relations(teachers, ({ one, many }) => ({
  company: one(companies, { fields: [teachers.companyId], references: [companies.id] }),
  branch: one(branches, { fields: [teachers.branchId], references: [branches.id] }),
  teacherProducts: many(teacherProducts),
}))

// ---------------------------------------------------------------------------
// TeacherProduct
// ---------------------------------------------------------------------------
export const teacherProductsRelations = relations(teacherProducts, ({ one }) => ({
  teacher: one(teachers, { fields: [teacherProducts.teacherId], references: [teachers.id] }),
  product: one(products, { fields: [teacherProducts.productId], references: [products.id] }),
}))

// ---------------------------------------------------------------------------
// Product
// ---------------------------------------------------------------------------
export const productsRelations = relations(products, ({ one, many }) => ({
  company: one(companies, { fields: [products.companyId], references: [companies.id] }),
  branch: one(branches, { fields: [products.branchId], references: [branches.id] }),
  pricings: many(productPricings),
  enrollments: many(enrollments),
  productSchedules: many(productSchedules),
  teacherProducts: many(teacherProducts),
}))

// ---------------------------------------------------------------------------
// ProductPricing
// ---------------------------------------------------------------------------
export const productPricingsRelations = relations(productPricings, ({ one, many }) => ({
  product: one(products, { fields: [productPricings.productId], references: [products.id] }),
  enrollments: many(enrollments),
  prices: many(productPrices),
}))

// ---------------------------------------------------------------------------
// ProductPrice
// ---------------------------------------------------------------------------
export const productPricesRelations = relations(productPrices, ({ one }) => ({
  productPricing: one(productPricings, {
    fields: [productPrices.productPricingId],
    references: [productPricings.id],
  }),
}))

// ---------------------------------------------------------------------------
// ProductSchedule
// ---------------------------------------------------------------------------
export const productSchedulesRelations = relations(productSchedules, ({ one }) => ({
  product: one(products, { fields: [productSchedules.productId], references: [products.id] }),
}))

// ---------------------------------------------------------------------------
// Category (self-referential)
// ---------------------------------------------------------------------------
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  company: one(companies, { fields: [categories.companyId], references: [companies.id] }),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'categoryHierarchy',
  }),
  children: many(categories, { relationName: 'categoryHierarchy' }),
}))

// ---------------------------------------------------------------------------
// Enrollment
// ---------------------------------------------------------------------------
export const enrollmentsRelations = relations(enrollments, ({ one, many }) => ({
  company: one(companies, { fields: [enrollments.companyId], references: [companies.id] }),
  branch: one(branches, { fields: [enrollments.branchId], references: [branches.id] }),
  student: one(students, { fields: [enrollments.studentId], references: [students.id] }),
  product: one(products, { fields: [enrollments.productId], references: [products.id] }),
  productPricing: one(productPricings, {
    fields: [enrollments.productPricingId],
    references: [productPricings.id],
  }),
  invoices: many(invoices),
}))

// ---------------------------------------------------------------------------
// Invoice
// ---------------------------------------------------------------------------
export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  company: one(companies, { fields: [invoices.companyId], references: [companies.id] }),
  branch: one(branches, { fields: [invoices.branchId], references: [branches.id] }),
  enrollment: one(enrollments, { fields: [invoices.enrollmentId], references: [enrollments.id] }),
  payments: many(payments),
}))

// ---------------------------------------------------------------------------
// Payment
// ---------------------------------------------------------------------------
export const paymentsRelations = relations(payments, ({ one }) => ({
  company: one(companies, { fields: [payments.companyId], references: [companies.id] }),
  branch: one(branches, { fields: [payments.branchId], references: [branches.id] }),
  invoice: one(invoices, { fields: [payments.invoiceId], references: [invoices.id] }),
}))

// ---------------------------------------------------------------------------
// ActivityLog
// ---------------------------------------------------------------------------
export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  company: one(companies, { fields: [activityLogs.companyId], references: [companies.id] }),
  branch: one(branches, { fields: [activityLogs.branchId], references: [branches.id] }),
  user: one(users, { fields: [activityLogs.userId], references: [users.id] }),
}))
