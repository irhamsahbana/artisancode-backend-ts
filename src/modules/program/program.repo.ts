import { eq, and, inArray, isNull } from 'drizzle-orm'

import { db } from '@/common/db'
import { getExecutor } from '@/common/executor'
import {
  productPrices as productPricesTable,
  productPricings as productPricingsTable,
  productSchedules as productSchedulesTable,
  products as productsTable,
  teacherProducts as teacherProductsTable,
  teachers as teachersTable,
} from '@/db/schema'
import * as Entity from '@/entities/program.entity'

import { IProgramRepo } from './program.contract'
import { toProgramEntity, type ProductWithRelations } from './program.mapper'
import { addPrice } from './program.repo/add-price'
import { addPricing } from './program.repo/add-pricing'
import { addSchedule } from './program.repo/add-schedule'
import { createProgram } from './program.repo/create'
import { deleteProgram } from './program.repo/delete'
import { deletePricing } from './program.repo/delete-pricing'
import { deleteSchedule } from './program.repo/delete-schedule'
import { findProgramById } from './program.repo/find-by-id'
import { findProgramByName } from './program.repo/find-by-name'
import { findProgramList } from './program.repo/find-list'
import { updateProgram } from './program.repo/update'
import { updateAllProgram } from './program.repo/update-all'
import { updatePrice } from './program.repo/update-price'

export interface ProgramRepoDeps {
  toProgramEntity: (data: ProductWithRelations) => Entity.Program
  fetchProductWithRelations: (productId: string) => Promise<ProductWithRelations>
}

async function fetchProductWithRelations(productId: string): Promise<ProductWithRelations> {
  const [product] = await getExecutor()
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, productId))
    .limit(1)

  const [schedules, pricings, teacherProductRows] = await Promise.all([
    db.select().from(productSchedulesTable).where(eq(productSchedulesTable.productId, productId)),
    db
      .select()
      .from(productPricingsTable)
      .where(
        and(
          eq(productPricingsTable.productId, productId),
          isNull(productPricingsTable.deletedAt),
        ),
      ),
    db
      .select()
      .from(teacherProductsTable)
      .innerJoin(teachersTable, eq(teacherProductsTable.teacherId, teachersTable.id))
      .where(eq(teacherProductsTable.productId, productId)),
  ])

  const pricingIds = pricings.map((p) => p.id)
  const allPrices =
    pricingIds.length > 0
      ? await getExecutor()
          .select()
          .from(productPricesTable)
          .where(inArray(productPricesTable.productPricingId, pricingIds))
      : []

  const pricesByPricing = new Map<string, typeof allPrices>()
  for (const price of allPrices) {
    const key = price.productPricingId
    const existing = pricesByPricing.get(key)
    if (existing) {
      existing.push(price)
    } else {
      pricesByPricing.set(key, [price])
    }
  }

  return {
    ...product,
    productSchedules: schedules,
    pricings: pricings.map((p) => ({
      ...p,
      prices: pricesByPricing.get(p.id) || [],
    })),
    teacherProducts: teacherProductRows.map((tp) => ({
      ...tp.teacher_products,
      teacher: tp.teachers,
    })),
  }
}

export function createProgramRepo(): IProgramRepo {
  const deps: ProgramRepoDeps = { toProgramEntity, fetchProductWithRelations }

  return {
    create: (req) => createProgram(deps, req),
    update: (req) => updateProgram(deps, req),
    updateAll: (req) => updateAllProgram(deps, req),
    delete: (id, companyId) => deleteProgram(id, companyId),
    findById: (id, companyId) => findProgramById(deps, id, companyId),
    findByName: (name, companyId, branchId) => findProgramByName(deps, name, companyId, branchId),
    findList: (req) => findProgramList(deps, req),
    addSchedule: (req) => addSchedule(req),
    addPricing: (req) => addPricing(req),
    addPrice: (req) => addPrice(req),
    updatePrice: (req) => updatePrice(req),
    deleteSchedule: (programId, scheduleId, companyId) =>
      deleteSchedule(programId, scheduleId, companyId),
    deletePricing: (programId, pricingId, companyId) =>
      deletePricing(programId, pricingId, companyId),
  }
}

export default createProgramRepo
