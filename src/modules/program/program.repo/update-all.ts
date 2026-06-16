import { eq, and, isNull, sql } from 'drizzle-orm'

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

export async function updateAllProgram(
  deps: ProgramRepoDeps,
  req: Entity.UpdateProgramAllReq,
): Promise<Entity.Program> {
  const { id, company_id, branch_id, schedules, pricings, teachers, ...rest } = req

  return await db.transaction(async (tx) => {
    await tx
      .update(productsTable)
      .set({ ...rest, branchId: branch_id })
      .where(
        and(
          eq(productsTable.id, id),
          eq(productsTable.companyId, company_id),
          isNull(productsTable.deletedAt),
        ),
      )

    if (schedules) {
      const idsToKeep = schedules.filter((s) => s.id).map((s) => s.id as string)
      const newSchedules = schedules.filter((s) => !s.id)
      const updateSchedules = schedules.filter((s) => s.id)

      await tx
        .delete(productSchedulesTable)
        .where(
          and(
            eq(productSchedulesTable.productId, id),
            idsToKeep.length > 0
              ? sql`${productSchedulesTable.id} NOT IN ${idsToKeep}`
              : sql`1=1`,
          ),
        )

      if (newSchedules.length > 0) {
        await tx.insert(productSchedulesTable).values(
          newSchedules.map((s) => ({
            productId: id,
            day: s.day || '',
            startTime: s.start_time || '',
            endTime: s.end_time || '',
          })),
        )
      }

      for (const s of updateSchedules) {
        await tx
          .update(productSchedulesTable)
          .set({ day: s.day, startTime: s.start_time, endTime: s.end_time })
          .where(eq(productSchedulesTable.id, s.id as string))
      }
    }

    if (pricings) {
      const idsToKeep = pricings.filter((p) => p.id).map((p) => p.id as string)
      const newPricings = pricings.filter((p) => !p.id)
      const updatePricings = pricings.filter((p) => p.id)

      if (idsToKeep.length > 0) {
        await tx
          .update(productPricingsTable)
          .set({ deletedAt: new Date() })
          .where(
            and(
              eq(productPricingsTable.productId, id),
              isNull(productPricingsTable.deletedAt),
              sql`${productPricingsTable.id} NOT IN ${idsToKeep}`,
            ),
          )
      } else {
        await tx
          .update(productPricingsTable)
          .set({ deletedAt: new Date() })
          .where(
            and(eq(productPricingsTable.productId, id), isNull(productPricingsTable.deletedAt)),
          )
      }

      for (const p of newPricings) {
        const [pricing] = await tx
          .insert(productPricingsTable)
          .values({ productId: id, name: p.name, description: p.description || '' })
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

      for (const p of updatePricings) {
        await tx
          .update(productPricingsTable)
          .set({ name: p.name, description: p.description })
          .where(eq(productPricingsTable.id, p.id as string))

        if (p.prices) {
          const priceIdsToKeep = p.prices
            .filter((price) => price.id)
            .map((price) => price.id as string)
          const newPrices = p.prices.filter((price) => !price.id)
          const updatePrices = p.prices.filter((price) => price.id)

          if (priceIdsToKeep.length > 0) {
            await tx
              .delete(productPricesTable)
              .where(
                and(
                  eq(productPricesTable.productPricingId, p.id as string),
                  sql`${productPricesTable.id} NOT IN ${priceIdsToKeep}`,
                ),
              )
          } else {
            await tx
              .delete(productPricesTable)
              .where(eq(productPricesTable.productPricingId, p.id as string))
          }

          if (newPrices.length > 0) {
            await tx.insert(productPricesTable).values(
              newPrices.map((price) => ({
                productPricingId: p.id as string,
                currency: price.currency,
                price: String(price.price),
                startedAt: price.started_at || new Date(),
                endedAt: price.ended_at,
              })),
            )
          }

          for (const price of updatePrices) {
            await tx
              .update(productPricesTable)
              .set({
                currency: price.currency,
                price: String(price.price),
                startedAt: price.started_at,
                endedAt: price.ended_at,
              })
              .where(eq(productPricesTable.id, price.id as string))
          }
        }
      }
    }

    if (teachers) {
      await tx.delete(teacherProductsTable).where(eq(teacherProductsTable.productId, id))

      if (teachers.length > 0) {
        await tx.insert(teacherProductsTable).values(
          teachers.map((teacherId) => ({
            teacherId,
            productId: id,
          })),
        )
      }
    }

    return deps.toProgramEntity(await deps.fetchProductWithRelations(id))
  })
}
