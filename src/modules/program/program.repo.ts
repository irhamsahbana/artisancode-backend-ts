import { eq, and, inArray, isNull, ilike, sql } from 'drizzle-orm'

import { db } from '@/common/db'
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

export default class ProgramRepo implements IProgramRepo {
  private async fetchProductWithRelations(productId: string): Promise<ProductWithRelations> {
    const [product] = await db
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

    // Fetch prices for each pricing
    const pricingIds = pricings.map((p) => p.id)
    const allPrices =
      pricingIds.length > 0
        ? await db
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

  async create(req: Entity.CreateProgramReq): Promise<Entity.Program> {
    return await db.transaction(async (tx) => {
      // Create product
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

      // Create schedules
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

      // Create pricings with prices
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

      // Create teacher associations
      if (req.teachers && req.teachers.length > 0) {
        await tx.insert(teacherProductsTable).values(
          req.teachers.map((teacherId) => ({
            teacherId,
            productId: product.id,
          })),
        )
      }

      return toProgramEntity(await this.fetchProductWithRelations(product.id))
    })
  }

  async update(req: Entity.UpdateProgramReq): Promise<Entity.Program> {
    const { id, company_id, ...rest } = req
    await db
      .update(productsTable)
      .set({
        branchId: rest.branch_id,
        name: rest.name,
        description: rest.description,
        capacity: rest.capacity,
        status: rest.status,
      })
      .where(
        and(
          eq(productsTable.id, id),
          eq(productsTable.companyId, company_id),
          isNull(productsTable.deletedAt),
        ),
      )

    return toProgramEntity(await this.fetchProductWithRelations(id))
  }

  async updateAll(req: Entity.UpdateProgramAllReq): Promise<Entity.Program> {
    const { id, company_id, branch_id, schedules, pricings, teachers, user, ...rest } = req
    void user

    return await db.transaction(async (tx) => {
      // Update product fields
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

      // Handle schedules
      if (schedules) {
        const idsToKeep = schedules.filter((s) => s.id).map((s) => s.id as string)
        const newSchedules = schedules.filter((s) => !s.id)
        const updateSchedules = schedules.filter((s) => s.id)

        // Delete schedules not in the list
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

        // Create new schedules
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

        // Update existing schedules
        for (const s of updateSchedules) {
          await tx
            .update(productSchedulesTable)
            .set({ day: s.day, startTime: s.start_time, endTime: s.end_time })
            .where(eq(productSchedulesTable.id, s.id as string))
        }
      }

      // Handle pricings
      if (pricings) {
        const idsToKeep = pricings.filter((p) => p.id).map((p) => p.id as string)
        const newPricings = pricings.filter((p) => !p.id)
        const updatePricings = pricings.filter((p) => p.id)

        // Soft delete pricings not in the list
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

        // Create new pricings with prices
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

        // Update existing pricings and their prices
        for (const p of updatePricings) {
          await tx
            .update(productPricingsTable)
            .set({ name: p.name, description: p.description })
            .where(eq(productPricingsTable.id, p.id as string))

          // Handle prices within this pricing
          if (p.prices) {
            const priceIdsToKeep = p.prices
              .filter((price) => price.id)
              .map((price) => price.id as string)
            const newPrices = p.prices.filter((price) => !price.id)
            const updatePrices = p.prices.filter((price) => price.id)

            // Delete prices not in the list
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

            // Create new prices
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

            // Update existing prices
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

      // Handle teachers
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

      return toProgramEntity(await this.fetchProductWithRelations(id))
    })
  }

  async delete(id: string, companyId: string): Promise<void> {
    await db
      .update(productsTable)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(productsTable.id, id),
          eq(productsTable.companyId, companyId),
          isNull(productsTable.deletedAt),
        ),
      )
  }

  async findById(id: string, companyId: string): Promise<Entity.Program | null> {
    const [product] = await db
      .select()
      .from(productsTable)
      .where(
        and(
          eq(productsTable.id, id),
          eq(productsTable.companyId, companyId),
          isNull(productsTable.deletedAt),
        ),
      )
      .limit(1)
    if (!product) return null
    return toProgramEntity(await this.fetchProductWithRelations(id))
  }

  async findByName(
    name: string,
    companyId: string,
    branchId?: string | null,
  ): Promise<Entity.Program | null> {
    const conditions = [
      eq(productsTable.companyId, companyId),
      ilike(productsTable.name, name),
      isNull(productsTable.deletedAt),
    ]

    if (branchId !== undefined) {
      if (branchId === null) {
        conditions.push(isNull(productsTable.branchId))
      } else {
        conditions.push(eq(productsTable.branchId, branchId))
      }
    }

    const [product] = await db
      .select()
      .from(productsTable)
      .where(and(...conditions))
      .limit(1)
    if (!product) return null
    return toProgramEntity(await this.fetchProductWithRelations(product.id))
  }

  async findList(req: Entity.GetProgramReq): Promise<Entity.ProgramList> {
    const { pagination = {}, q, company_id, branch_id } = req
    const { page = 1, per_page = 10 } = pagination
    const offset = (page - 1) * per_page

    const conditions = [eq(productsTable.companyId, company_id), isNull(productsTable.deletedAt)]

    if (q) {
      conditions.push(ilike(productsTable.name, `%${q}%`))
    }

    if (branch_id) {
      conditions.push(
        sql`(${productsTable.branchId} = ${branch_id} OR ${productsTable.branchId} IS NULL)`,
      )
    }

    const where = and(...conditions)

    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(productsTable)
        .where(where)
        .orderBy(sql`${productsTable.createdAt} desc`)
        .limit(per_page)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(productsTable)
        .where(where),
    ])

    const total = countResult[0]?.count ?? 0

    // Fetch relations for all items
    const itemsWithRelations = await Promise.all(
      items.map((item) => this.fetchProductWithRelations(item.id)),
    )

    return {
      items: itemsWithRelations.map((item) => toProgramEntity(item)),
      pagination: {
        total,
        page,
        per_page,
        last_page: Math.ceil(total / per_page),
      },
    }
  }

  async addSchedule(req: Entity.AddScheduleReq): Promise<Entity.ProgramSchedule> {
    const [row] = await db
      .insert(productSchedulesTable)
      .values({
        productId: req.program_id,
        day: req.day || '',
        startTime: req.start_time || '',
        endTime: req.end_time || '',
      })
      .returning()

    return {
      id: row.id,
      program_id: row.productId,
      day: row.day,
      start_time: row.startTime,
      end_time: row.endTime,
      created_at: row.createdAt,
      updated_at: row.updatedAt,
    }
  }

  async addPricing(req: Entity.AddPricingReq): Promise<Entity.ProgramPricing> {
    return await db.transaction(async (tx) => {
      const [pricing] = await tx
        .insert(productPricingsTable)
        .values({
          productId: req.program_id,
          name: req.name,
          description: req.description || '',
        })
        .returning()

      let prices: Entity.ProgramPrice[] = []
      if (req.prices && req.prices.length > 0) {
        const priceRows = await tx
          .insert(productPricesTable)
          .values(
            req.prices.map((p) => ({
              productPricingId: pricing.id,
              currency: p.currency,
              price: String(p.price),
              startedAt: p.started_at || new Date(),
              endedAt: p.ended_at,
            })),
          )
          .returning()

        prices = priceRows.map((p) => ({
          id: p.id,
          pricing_id: p.productPricingId,
          currency: p.currency,
          price: Number(p.price),
          started_at: p.startedAt,
          ended_at: p.endedAt,
          created_at: p.createdAt,
        }))
      }

      return {
        id: pricing.id,
        program_id: pricing.productId,
        name: pricing.name,
        description: pricing.description,
        is_active: pricing.isActive,
        created_at: pricing.createdAt,
        updated_at: pricing.updatedAt,
        prices,
      }
    })
  }

  async addPrice(req: Entity.AddPriceReq): Promise<Entity.ProgramPrice> {
    const [row] = await db
      .insert(productPricesTable)
      .values({
        productPricingId: req.pricing_id,
        currency: req.currency,
        price: String(req.price),
        startedAt: req.started_at || new Date(),
        endedAt: req.ended_at,
      })
      .returning()

    return {
      id: row.id,
      pricing_id: row.productPricingId,
      currency: row.currency,
      price: Number(row.price),
      started_at: row.startedAt,
      ended_at: row.endedAt,
      created_at: row.createdAt,
    }
  }

  async updatePrice(req: Entity.UpdatePriceReq): Promise<Entity.ProgramPrice> {
    // Verify ownership via joins
    const [existing] = await db
      .select({ id: productPricesTable.id })
      .from(productPricesTable)
      .innerJoin(
        productPricingsTable,
        eq(productPricesTable.productPricingId, productPricingsTable.id),
      )
      .innerJoin(productsTable, eq(productPricingsTable.productId, productsTable.id))
      .where(
        and(
          eq(productPricesTable.id, req.price_id),
          eq(productPricingsTable.id, req.pricing_id),
          eq(productPricingsTable.productId, req.program_id),
          eq(productsTable.companyId, req.company_id),
        ),
      )
      .limit(1)

    if (!existing) throw new Error('Price not found')

    const [row] = await db
      .update(productPricesTable)
      .set({
        price: req.price !== undefined ? String(req.price) : undefined,
        startedAt: req.started_at,
        endedAt: req.ended_at,
      })
      .where(eq(productPricesTable.id, req.price_id))
      .returning()

    return {
      id: row.id,
      pricing_id: row.productPricingId,
      currency: row.currency,
      price: Number(row.price),
      started_at: row.startedAt,
      ended_at: row.endedAt,
      created_at: row.createdAt,
    }
  }

  async deleteSchedule(programId: string, scheduleId: string, companyId: string): Promise<void> {
    // Verify ownership and delete
    const [existing] = await db
      .select({ id: productSchedulesTable.id })
      .from(productSchedulesTable)
      .innerJoin(productsTable, eq(productSchedulesTable.productId, productsTable.id))
      .where(
        and(
          eq(productSchedulesTable.id, scheduleId),
          eq(productSchedulesTable.productId, programId),
          eq(productsTable.companyId, companyId),
        ),
      )
      .limit(1)

    if (existing) {
      await db.delete(productSchedulesTable).where(eq(productSchedulesTable.id, scheduleId))
    }
  }

  async deletePricing(programId: string, pricingId: string, companyId: string): Promise<void> {
    // Verify ownership and soft delete
    const [existing] = await db
      .select({ id: productPricingsTable.id })
      .from(productPricingsTable)
      .innerJoin(productsTable, eq(productPricingsTable.productId, productsTable.id))
      .where(
        and(
          eq(productPricingsTable.id, pricingId),
          eq(productPricingsTable.productId, programId),
          eq(productsTable.companyId, companyId),
          isNull(productPricingsTable.deletedAt),
        ),
      )
      .limit(1)

    if (existing) {
      await db
        .update(productPricingsTable)
        .set({ deletedAt: new Date() })
        .where(eq(productPricingsTable.id, pricingId))
    }
  }
}
