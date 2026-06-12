import { eq, and, or, ilike, isNull, sql } from 'drizzle-orm'
import { v7 as uuidv7 } from 'uuid'

import { getExecutor } from '@/common/executor'
import { branches, teachers } from '@/db/schema'
import * as Entity from '@/entities/teacher.entity'

import { ITeacherRepo } from './teacher.contract'

export default class TeacherRepo implements ITeacherRepo {
  private toEntity(
    data: typeof teachers.$inferSelect & { branch?: { id: string; name: string } | null },
  ): Entity.Teacher {
    return {
      id: data.id,
      company_id: data.companyId,
      branch: data.branch
        ? {
            id: data.branch.id,
            name: data.branch.name,
          }
        : undefined,
      status: data.status,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      birth_date: data.birthDate,
      biography: data.biography,
      specialty: data.specialty,
      created_at: data.createdAt,
      updated_at: data.updatedAt,
      deleted_at: data.deletedAt,
    }
  }

  async create(req: Entity.CreateTeacherReq): Promise<Entity.Teacher> {
    const id = req.id || uuidv7()
    const [row] = await getExecutor()
      .insert(teachers)
      .values({
        id,
        companyId: req.company_id,
        branchId: req.branch_id,
        status: req.status ?? 'active',
        name: req.name,
        email: req.email,
        phone: req.phone || '',
        address: req.address || '',
        birthDate: req.birth_date || '',
        biography: req.biography || '',
        specialty: req.specialty || '',
      })
      .returning()

    // Fetch with branch
    const [withBranch] = await getExecutor()
      .select({
        id: teachers.id,
        companyId: teachers.companyId,
        branchId: teachers.branchId,
        status: teachers.status,
        name: teachers.name,
        email: teachers.email,
        phone: teachers.phone,
        address: teachers.address,
        birthDate: teachers.birthDate,
        biography: teachers.biography,
        specialty: teachers.specialty,
        createdAt: teachers.createdAt,
        updatedAt: teachers.updatedAt,
        deletedAt: teachers.deletedAt,
        branch: {
          id: branches.id,
          name: branches.name,
        },
      })
      .from(teachers)
      .leftJoin(branches, eq(teachers.branchId, branches.id))
      .where(eq(teachers.id, row.id))
      .limit(1)

    return this.toEntity(withBranch)
  }

  async update(req: Entity.UpdateTeacherReq): Promise<Entity.Teacher> {
    const [row] = await getExecutor()
      .update(teachers)
      .set({
        branchId: req.branch_id,
        status: req.status,
        name: req.name,
        email: req.email,
        phone: req.phone,
        address: req.address,
        birthDate: req.birth_date,
        biography: req.biography,
        specialty: req.specialty,
      })
      .where(
        and(
          eq(teachers.id, req.id),
          eq(teachers.companyId, req.company_id),
          isNull(teachers.deletedAt),
        ),
      )
      .returning()

    // Fetch with branch
    const [withBranch] = await getExecutor()
      .select({
        id: teachers.id,
        companyId: teachers.companyId,
        branchId: teachers.branchId,
        status: teachers.status,
        name: teachers.name,
        email: teachers.email,
        phone: teachers.phone,
        address: teachers.address,
        birthDate: teachers.birthDate,
        biography: teachers.biography,
        specialty: teachers.specialty,
        createdAt: teachers.createdAt,
        updatedAt: teachers.updatedAt,
        deletedAt: teachers.deletedAt,
        branch: {
          id: branches.id,
          name: branches.name,
        },
      })
      .from(teachers)
      .leftJoin(branches, eq(teachers.branchId, branches.id))
      .where(eq(teachers.id, row.id))
      .limit(1)

    return this.toEntity(withBranch)
  }

  async delete(id: string, companyId: string): Promise<void> {
    await getExecutor()
      .update(teachers)
      .set({ deletedAt: new Date() })
      .where(
        and(eq(teachers.id, id), eq(teachers.companyId, companyId), isNull(teachers.deletedAt)),
      )
  }

  async findById(id: string, companyId: string): Promise<Entity.Teacher | null> {
    const [row] = await getExecutor()
      .select({
        id: teachers.id,
        companyId: teachers.companyId,
        branchId: teachers.branchId,
        status: teachers.status,
        name: teachers.name,
        email: teachers.email,
        phone: teachers.phone,
        address: teachers.address,
        birthDate: teachers.birthDate,
        biography: teachers.biography,
        specialty: teachers.specialty,
        createdAt: teachers.createdAt,
        updatedAt: teachers.updatedAt,
        deletedAt: teachers.deletedAt,
        branch: {
          id: branches.id,
          name: branches.name,
        },
      })
      .from(teachers)
      .leftJoin(branches, eq(teachers.branchId, branches.id))
      .where(
        and(eq(teachers.id, id), eq(teachers.companyId, companyId), isNull(teachers.deletedAt)),
      )
      .limit(1)
    return row ? this.toEntity(row) : null
  }

  async findByEmail(email: string): Promise<Entity.Teacher | null> {
    const [row] = await getExecutor()
      .select()
      .from(teachers)
      .where(and(eq(teachers.email, email), isNull(teachers.deletedAt)))
      .limit(1)
    return row ? this.toEntity(row) : null
  }

  async findList(req: Entity.GetTeacherReq): Promise<Entity.TeacherList> {
    const { pagination = {}, q, company_id, branch_id } = req
    const { page = 1, per_page = 10 } = pagination
    const offset = (page - 1) * per_page

    const conditions = [eq(teachers.companyId, company_id), isNull(teachers.deletedAt)]

    if (q) {
      const qCondition = or(
        ilike(teachers.name, `%${q}%`),
        ilike(teachers.email, `%${q}%`),
        ilike(teachers.specialty, `%${q}%`),
      )
      if (qCondition) conditions.push(qCondition)
    }

    if (branch_id) {
      conditions.push(eq(teachers.branchId, branch_id))
    }

    const where = and(...conditions)

    const exec = getExecutor()
    const [items, countResult] = await Promise.all([
      exec
        .select({
          id: teachers.id,
          companyId: teachers.companyId,
          branchId: teachers.branchId,
          status: teachers.status,
          name: teachers.name,
          email: teachers.email,
          phone: teachers.phone,
          address: teachers.address,
          birthDate: teachers.birthDate,
          biography: teachers.biography,
          specialty: teachers.specialty,
          createdAt: teachers.createdAt,
          updatedAt: teachers.updatedAt,
          deletedAt: teachers.deletedAt,
          branch: {
            id: branches.id,
            name: branches.name,
          },
        })
        .from(teachers)
        .leftJoin(branches, eq(teachers.branchId, branches.id))
        .where(where)
        .orderBy(sql`${teachers.createdAt} desc`)
        .limit(per_page)
        .offset(offset),
      exec
        .select({ count: sql<number>`count(*)::int` })
        .from(teachers)
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
