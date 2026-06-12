import { Context } from 'hono'

import { responseError, responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import * as Entity from '@/entities/teacher.entity'

import { ITeacherUsecase } from './teacher.contract'

export default class TeacherHandler {
  constructor(private usecase: ITeacherUsecase) {}

  create = async (c: Context<AppEnv>) => {
    const user = c.get('user')
    const body = c.get('body')
    const payload = body as Entity.CreateTeacherReq
    payload.company_id = user?.company_id || ''
    payload.user = user

    const data = await this.usecase.create(payload)
    return c.json(responseSuccess(data, 'Teacher created successfully'), 201)
  }

  update = async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')
    const body = c.get('body')
    const payload = body as Entity.UpdateTeacherReq

    payload.id = id
    payload.company_id = user?.company_id || ''
    payload.user = user

    const data = await this.usecase.update(payload)
    return c.json(responseSuccess(data, 'Teacher updated successfully'))
  }

  delete = async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')

    await this.usecase.delete(id, user?.company_id || '')
    return c.json(responseSuccess(null, 'Teacher deleted successfully'))
  }

  findById = async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')

    const data = await this.usecase.findById(id, user?.company_id || '')
    if (!data) {
      return c.json(responseError('Teacher not found'), 404)
    }
    return c.json(responseSuccess(data))
  }

  findList = async (c: Context<AppEnv>) => {
    const query = c.get('body')?._query || c.req.query()
    const { page, limit, q, branch_id } = query as {
      page: number
      limit: number
      q: string
      branch_id: string
    }
    const user = c.get('user')

    const payload: Entity.GetTeacherReq = {
      company_id: user?.company_id || '',
      q,
      branch_id,
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
