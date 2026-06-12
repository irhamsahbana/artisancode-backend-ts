import { db } from '@/common/db'
import {
  productPrices as productPricesTable,
  productPricings as productPricingsTable,
  productSchedules as productSchedulesTable,
  products as productsTable,
  teacherProducts as teacherProductsTable,
} from '@/db/schema'
import * as Entity from '@/entities/program.entity'

import { ProgramRepoDeps } from '../program.repo'

export async function createProgram(
  deps: ProgramRepoDeps,
  req: Entity.CreateProgramReq,
): Promise<Entity.Program> {
  return await db.transaction(async (tx) => {
    const [product] = await tx
      .insert(productsTable)
      .values({
        companyId: req.company_id,
        branchId: req.branch_id,
        name: req.name,
        description: req.description || '',
        capacity: req.capacity || 0,
        status: req.status || 'active',
      })
      .returning()

    if (req.schedules && req.schedules.length > 0) {
      await tx.insert(productSchedulesTable).values(
        req.schedules.map((s) => ({
          productId: product.id,
          day: s.day || '',
          startTime: s.start_time || '',
          endTime: s.end_time || '',
        })),
      )
    }

    if (req.pricings && req.pricings.length > 0) {
      for (const p of req.pricings) {
        const [pricing] = await tx
          .insert(productPricingsTable)
          .values({
            productId: product.id,
            name: p.name,
            description: p.description || '',
          })
          .returning()

        if (p.prices && p.prices.length > 0) {
          await tx.insert(productPricesTable).values(
            p.prices.map((price) => ({
              productPricingId: pricing.id,
              currency: price.currency,
              price: String(price.price),
              startedAt: price.started_at || new Date(),
              endedAt: price.ended_at,
            })),
          )
        }
      }
    }

    if (req.teachers && req.teachers.length > 0) {
      await tx.insert(teacherProductsTable).values(
        req.teachers.map((teacherId) => ({
          teacherId,
          productId: product.id,
        })),
      )
    }

    return deps.toProgramEntity(await deps.fetchProductWithRelations(product.id))
  })
}
