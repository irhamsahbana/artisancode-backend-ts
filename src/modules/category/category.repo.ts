import { eq, and, ilike, isNull, sql } from 'drizzle-orm'

import { db } from '@/common/db'
import { categories } from '@/db/schema'
import * as Entity from '@/entities/category.entity'

import { ICategoryRepo } from './category.contract'

export default class CategoryRepo implements ICategoryRepo {
  private toEntity(data: typeof categories.$inferSelect): Entity.Category {
    return {
      id: data.id,
      company_id: data.companyId || '',
      parent_id: data.parentId,
      group: data.group,
      name: data.name,
      status: data.status,
      created_at: data.createdAt,
      updated_at: data.updatedAt,
      deleted_at: data.deletedAt,
    }
  }

  async create(req: Entity.CreateCategoryReq): Promise<Entity.Category> {
    const [row] = await db
      .insert(categories)
      .values({
        companyId: req.company_id,
        parentId: req.parent_id,
        group: req.group || '',
        name: req.name,
        status: (req.status as 'active' | 'inactive') ?? 'active',
      })
      .returning()
    return this.toEntity(row)
  }

  async update(req: Entity.UpdateCategoryReq): Promise<Entity.Category> {
    const [row] = await db
      .update(categories)
      .set({
        parentId: req.parent_id,
        group: req.group,
        name: req.name,
        status: req.status as 'active' | 'inactive',
      })
      .where(
        and(
          eq(categories.id, req.id),
          eq(categories.companyId, req.company_id),
          isNull(categories.deletedAt),
        ),
      )
      .returning()
    return this.toEntity(row)
  }

  async delete(id: string, companyId: string): Promise<void> {
    await db
      .update(categories)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(categories.id, id),
          eq(categories.companyId, companyId),
          isNull(categories.deletedAt),
        ),
      )
  }

  async findById(id: string, companyId: string): Promise<Entity.Category | null> {
    const [row] = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.id, id),
          eq(categories.companyId, companyId),
          isNull(categories.deletedAt),
        ),
      )
      .limit(1)
    return row ? this.toEntity(row) : null
  }

  async findList(req: Entity.GetCategoryReq): Promise<Entity.CategoryList> {
    const { pagination = {}, q, company_id, group } = req
    const { page = 1, per_page = 10 } = pagination
    const offset = (page - 1) * per_page

    const conditions = [eq(categories.companyId, company_id), isNull(categories.deletedAt)]

    if (q) {
      conditions.push(ilike(categories.name, `%${q}%`))
    }

    if (group) {
      conditions.push(eq(categories.group, group))
    }

    const where = and(...conditions)

    const [items, countResult] = await Promise.all([
      db
        .select()
        .from(categories)
        .where(where)
        .orderBy(sql`${categories.createdAt} desc`)
        .limit(per_page)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(categories)
        .where(where),
    ])

    const total = countResult[0]?.count ?? 0

    return {
      items: items.map((item) => this.toEntity(item)),
      pagination: {
        total,
        page,
        per_page,
        last_page: Math.ceil(total / per_page),
      },
    }
  }
}
