import { Context } from 'hono'

import { responseError, responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import * as Entity from '@/entities/branch.entity'

import { IBranchUsecase } from './branch.contract'

export default class BranchHandler {
  constructor(private usecase: IBranchUsecase) {}

  create = async (c: Context<AppEnv>) => {
    const user = c.get('user')
    const companyId = user?.company_id || ''
    const body = c.get('body')
    const payload: Entity.CreateBranchReq = {
      ...body,
      company_id: companyId,
      user,
    }

    const data = await this.usecase.create(payload)
    return c.json(responseSuccess(data, 'Branch created successfully'), 201)
  }

  update = async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')
    const companyId = user?.company_id || ''
    const body = c.get('body')

    const payload: Entity.UpdateBranchReq = {
      ...body,
      id,
      company_id: companyId,
      user,
    }

    const data = await this.usecase.update(payload)
    return c.json(responseSuccess(data, 'Branch updated successfully'))
  }

  delete = async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')
    const companyId = user?.company_id || ''

    await this.usecase.delete(id, companyId)
    return c.json(responseSuccess(null, 'Branch deleted successfully'))
  }

  findById = async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')
    const companyId = user?.company_id || ''

    const data = await this.usecase.findById(id, companyId)
    if (!data) {
      return c.json(responseError('Branch not found'), 404)
    }
    return c.json(responseSuccess(data))
  }

  findList = async (c: Context<AppEnv>) => {
    const query = c.get('body')?._query || c.req.query()
    const { page, limit, q } = query as { page: number; limit: number; q: string }
    const user = c.get('user')
    const companyId = user?.company_id || ''

    const payload: Entity.GetBranchReq = {
      company_id: companyId,
      q,
      pagination: {
        page: Number(page) || 1,
        per_page: Number(limit) || 10,
      },
      user,
    }

    const data = await this.usecase.findList(payload)
    return c.json(responseSuccess(data))
  }
}
