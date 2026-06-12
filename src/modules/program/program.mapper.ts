import {
  productPrices as productPricesTable,
  productPricings as productPricingsTable,
  productSchedules as productSchedulesTable,
  products as productsTable,
  teacherProducts as teacherProductsTable,
  teachers as teachersTable,
} from '@/db/schema'
import * as Entity from '@/entities/program.entity'

type ProductRow = typeof productsTable.$inferSelect
type ProductScheduleRow = typeof productSchedulesTable.$inferSelect
type ProductPricingRow = typeof productPricingsTable.$inferSelect
type ProductPriceRow = typeof productPricesTable.$inferSelect
type TeacherProductRow = typeof teacherProductsTable.$inferSelect
type TeacherRow = typeof teachersTable.$inferSelect

export type ProductWithRelations = ProductRow & {
  productSchedules: ProductScheduleRow[]
  pricings: (ProductPricingRow & {
    prices: ProductPriceRow[]
  })[]
  teacherProducts: (TeacherProductRow & {
    teacher: TeacherRow
  })[]
}

export const toProgramEntity = (data: ProductWithRelations): Entity.Program => ({
  id: data.id,
  company_id: data.companyId,
  branch_id: data.branchId,
  name: data.name,
  description: data.description,
  capacity: data.capacity,
  status: data.status,
  created_at: data.createdAt,
  updated_at: data.updatedAt,
  deleted_at: data.deletedAt,
  schedules: data.productSchedules?.map((s) => ({
    id: s.id,
    program_id: s.productId,
    day: s.day,
    start_time: s.startTime,
    end_time: s.endTime,
    created_at: s.createdAt,
    updated_at: s.updatedAt,
  })),
  pricings: data.pricings?.map((p) => ({
    id: p.id,
    program_id: p.productId,
    name: p.name,
    description: p.description,
    is_active: p.isActive,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
    prices: p.prices?.map((price) => ({
      id: price.id,
      pricing_id: price.productPricingId,
      currency: price.currency,
      price: Number(price.price),
      started_at: price.startedAt,
      ended_at: price.endedAt,
      created_at: price.createdAt,
    })),
  })),
  teachers: data.teacherProducts?.map((tp) => ({
    id: tp.teacher.id,
    name: tp.teacher.name,
    email: tp.teacher.email,
    specialty: tp.teacher.specialty,
  })),
})
