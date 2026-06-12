import { eq, and, ilike, isNull, sql } from 'drizzle-orm'

import { getExecutor } from '@/common/executor'
import { branches } from '@/db/schema'
import * as Entity from '@/entities/branch.entity'

import { IBranchRepo } from './branch.contract'

export default class BranchRepo implements IBranchRepo {
  private toEntity(data: typeof branches.$inferSelect): Entity.Branch {
    return {
      id: data.id,
      company_id: data.companyId,
      name: data.name,
      city: data.city,
      capacity: data.capacity,
      description: data.description,
      address: data.address,
      phone: data.phone,
      email: data.email,
      head_coach: data.headCoach,
      status: data.status,
      created_at: data.createdAt,
      updated_at: data.updatedAt,
      deleted_at: data.deletedAt,
    }
  }

  async create(req: Entity.CreateBranchReq): Promise<Entity.Branch> {
    const [row] = await getExecutor()
      .insert(branches)
      .values({
        companyId: req.company_id,
        name: req.name,
        city: req.city,
        capacity: req.capacity ?? 0,
        description: req.description ?? '',
        address: req.address ?? '',
        phone: req.phone ?? '',
        email: req.email ?? '',
        headCoach: req.head_coach ?? '',
        status: (req.status as 'active' | 'inactive') ?? 'active',
      })
      .returning()
    return this.toEntity(row)
  }

  async update(req: Entity.UpdateBranchReq): Promise<Entity.Branch> {
    const [row] = await getExecutor()
      .update(branches)
      .set({
        name: req.name,
        city: req.city,
        capacity: req.capacity,
        description: req.description,
        address: req.address,
        phone: req.phone,
        email: req.email,
        headCoach: req.head_coach,
        status: req.status as 'active' | 'inactive',
      })
      .where(
        and(
          eq(branches.id, req.id),
          eq(branches.companyId, req.company_id),
          isNull(branches.deletedAt),
        ),
      )
      .returning()
    return this.toEntity(row)
  }

  async delete(id: string, companyId: string): Promise<void> {
    await getExecutor()
      .update(branches)
      .set({ deletedAt: new Date() })
      .where(
        and(eq(branches.id, id), eq(branches.companyId, companyId), isNull(branches.deletedAt)),
      )
  }

  async findById(id: string, companyId: string): Promise<Entity.Branch | null> {
    const [row] = await getExecutor()
      .select()
      .from(branches)
      .where(
        and(eq(branches.id, id), eq(branches.companyId, companyId), isNull(branches.deletedAt)),
      )
      .limit(1)
    return row ? this.toEntity(row) : null
  }

  async findList(req: Entity.GetBranchReq): Promise<Entity.BranchList> {
    const { pagination = {}, q, company_id } = req
    const { page = 1, per_page = 10 } = pagination
    const offset = (page - 1) * per_page

    const conditions = [eq(branches.companyId, company_id), isNull(branches.deletedAt)]

    if (q) {
      conditions.push(ilike(branches.name, `%${q}%`))
    }

    const where = and(...conditions)

    const exec = getExecutor()
    const [items, countResult] = await Promise.all([
      exec
        .select()
        .from(branches)
        .where(where)
        .orderBy(sql`${branches.createdAt} desc`)
        .limit(per_page)
        .offset(offset),
      exec
        .select({ count: sql<number>`count(*)::int` })
        .from(branches)
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
