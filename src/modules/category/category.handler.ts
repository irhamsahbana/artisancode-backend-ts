import { Context } from 'hono'

import { responseError, responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import * as Entity from '@/entities/category.entity'

import { ICategoryUsecase } from './category.contract'

export default class CategoryHandler {
  constructor(private usecase: ICategoryUsecase) {}

  create = async (c: Context<AppEnv>) => {
    const user = c.get('user')
    const companyId = user?.company_id || ''
    const body = c.get('body')
    const payload: Entity.CreateCategoryReq = {
      ...body,
      company_id: companyId,
      user,
    }

    const data = await this.usecase.create(payload)
    return c.json(responseSuccess(data, 'Category created successfully'), 201)
  }

  update = async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')
    const companyId = user?.company_id || ''
    const body = c.get('body')

    const payload: Entity.UpdateCategoryReq = {
      ...body,
      id,
      company_id: companyId,
      user,
    }

    const data = await this.usecase.update(payload)
    return c.json(responseSuccess(data, 'Category updated successfully'))
  }

  delete = async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')
    const companyId = user?.company_id || ''

    await this.usecase.delete(id, companyId)
    return c.json(responseSuccess(null, 'Category deleted successfully'))
  }

  findById = async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')
    const companyId = user?.company_id || ''

    const data = await this.usecase.findById(id, companyId)
    if (!data) {
      return c.json(responseError('Category not found'), 404)
    }
    return c.json(responseSuccess(data))
  }

  findList = async (c: Context<AppEnv>) => {
    const query = c.get('body')?._query || c.req.query()
    const { page, limit, q, group } = query as {
      page: number
      limit: number
      q: string
      group: string
    }
    const user = c.get('user')
    const companyId = user?.company_id || ''

    const payload: Entity.GetCategoryReq = {
      company_id: companyId,
      q,
      group,
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
