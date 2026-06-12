import { eq, and, ilike, inArray, isNull, sql } from 'drizzle-orm'

import { db } from '@/common/db'
import { companies } from '@/db/schema'
import * as Entity from '@/entities/company.entity'

import { ICompanyRepo } from './company.contract'

export default class CompanyRepo implements ICompanyRepo {
  async create(req: Entity.CreateCompanyReq): Promise<Entity.Company> {
    const status = req.status === 'inactive' ? 'inactive' : 'active'
    const [row] = await db.insert(companies).values({ name: req.name, status }).returning()
    return row as Entity.Company
  }

  async findList(req: Entity.GetCompanyReq): Promise<Entity.CompanyList> {
    const { pagination = {}, q, accessible_company_id, ids, id } = req
    const { page = 1, per_page = 10 } = pagination
    const offset = (page - 1) * per_page

    const conditions = [isNull(companies.deletedAt)]

    if (id) {
      conditions.push(eq(companies.id, id))
    }

    if (q) {
      conditions.push(ilike(companies.name, `%${q}%`))
    }

    if (accessible_company_id) {
      conditions.push(eq(companies.id, accessible_company_id))
    } else if (ids && ids.length > 0) {
      conditions.push(inArray(companies.id, ids))
    }

    const where = and(...conditions)

    const [items, countResult] = await Promise.all([
      db.select().from(companies).where(where).limit(per_page).offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(companies)
        .where(where),
    ])

    const total = countResult[0]?.count ?? 0

    return {
      items: items as Entity.Company[],
      pagination: {
        total,
        page,
        per_page,
        last_page: Math.ceil(total / per_page),
      },
    }
  }

  async findById(req: Entity.GetCompanyReq): Promise<Entity.Company | null> {
    const conditions = [eq(companies.id, req.id ?? ''), isNull(companies.deletedAt)]

    if (req.accessible_company_id) {
      if (req.id && req.id !== req.accessible_company_id) {
        return null
      }
      conditions[0] = eq(companies.id, req.accessible_company_id)
    }

    const [row] = await db
      .select()
      .from(companies)
      .where(and(...conditions))
      .limit(1)
    return (row as Entity.Company) ?? null
  }

  async update(req: Entity.UpdateCompanyReq): Promise<Entity.Company> {
    const status = req.status === 'inactive' ? 'inactive' : 'active'

    if (req.accessible_company_id && req.id !== req.accessible_company_id) {
      throw new Error('Company not found')
    }

    const [row] = await db
      .update(companies)
      .set({
        ...req,
        status: req.status ? status : undefined,
      })
      .where(eq(companies.id, req.id))
      .returning()

    return row as Entity.Company
  }

  async delete(req: Entity.GetCompanyReq): Promise<void> {
    if (req.accessible_company_id && req.id !== req.accessible_company_id) {
      throw new Error('Company not found')
    }

    await db
      .update(companies)
      .set({ deletedAt: new Date() })
      .where(eq(companies.id, req.id ?? ''))
  }
}
