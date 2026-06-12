import { Context } from 'hono'

import { responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import * as Entity from '@/entities/company.entity'

import { ICompanyUsecase } from './company.contract'

export default class CompanyHandler {
  constructor(private readonly usecase: ICompanyUsecase) {}

  create = async (c: Context<AppEnv>) => {
    const user = c.get('user')
    const body = c.get('body')
    const payload: Entity.CreateCompanyReq = {
      ...body,
      user,
    }
    const data = await this.usecase.create(payload)
    return c.json(responseSuccess(data, 'Company created successfully'), 201)
  }

  findList = async (c: Context<AppEnv>) => {
    const query = c.get('body')?._query || c.req.query()
    const { page, limit, q, ids } = query as {
      page: number
      limit: number
      q: string
      ids?: string
    }
    const user = c.get('user')
    const companyId = user?.company_id || ''

    const payload: Entity.GetCompanyReq = {
      ids: ids ? ids.split(',') : undefined,
      pagination: {
        page,
        per_page: limit,
      },
      user,
    }

    if (companyId) {
      payload.accessible_company_id = companyId
    }

    if (q) {
      payload.q = q
    }

    const data = await this.usecase.findList(payload)
    return c.json(responseSuccess(data))
  }

  findById = async (c: Context<AppEnv>) => {
    const id = c.req.param('id')
    const user = c.get('user')
    const companyId = user?.company_id || ''

    const payload: Entity.GetCompanyReq = { id, user }
    if (companyId) {
      payload.accessible_company_id = companyId
    }

    const data = await this.usecase.findById(payload)
    if (!data) {
      return c.json(responseSuccess(null, 'Company not found'), 404)
    }
    return c.json(responseSuccess(data))
  }

  update = async (c: Context<AppEnv>) => {
    const id = c.req.param('id')
    const user = c.get('user')
    const companyId = user?.company_id || ''
    const body = c.get('body')

    const payload: Entity.UpdateCompanyReq = { ...body, id, user }
    if (companyId) {
      payload.accessible_company_id = companyId
    }

    const data = await this.usecase.update(payload)
    return c.json(responseSuccess(data, 'Company updated successfully'))
  }

  delete = async (c: Context<AppEnv>) => {
    const id = c.req.param('id')
    const user = c.get('user')
    const companyId = user?.company_id || ''

    const payload: Entity.GetCompanyReq = { id, user }
    if (companyId) {
      payload.accessible_company_id = companyId
    }

    await this.usecase.delete(payload)
    return c.json(responseSuccess(null, 'Company deleted successfully'))
  }
}
