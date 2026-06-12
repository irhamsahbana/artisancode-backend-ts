import { Context } from 'hono'

import { responseError, responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import * as Entity from '@/entities/user.entity'

import { IUserUsecase } from './user.contract'

export default class UserHandler {
  constructor(private usecase: IUserUsecase) {}

  create = async (c: Context<AppEnv>) => {
    const body = c.get('body')
    const payload = body as Entity.CreateUserReq
    const user = c.get('user')
    const companyId = user?.company_id || ''

    if (companyId) {
      payload.company_id = companyId
    }
    payload.user = user

    const data = await this.usecase.create(payload)
    return c.json(responseSuccess(data, 'User created successfully'), 201)
  }

  register = async (c: Context<AppEnv>) => {
    const body = c.get('body')
    const payload = body as Entity.RegisterReq
    const data = await this.usecase.register(payload)
    return c.json(responseSuccess(data, 'Company registered successfully'), 201)
  }

  login = async (c: Context<AppEnv>) => {
    const body = c.get('body')
    const payload = body as Entity.LoginReq
    const data = await this.usecase.login(payload)
    if (!data) {
      return c.json(responseError('Invalid credentials'), 401)
    }
    return c.json(responseSuccess(data, 'Login successful'))
  }

  findList = async (c: Context<AppEnv>) => {
    const query = c.get('body')?._query || c.req.query()
    const { page, limit, q } = query as { page: number; limit: number; q: string }
    const user = c.get('user')
    const companyId = user?.company_id || ''

    const payload: Entity.GetUserReq = {
      pagination: {
        page: Number(page) || 1,
        per_page: Number(limit) || 10,
      },
      user,
    }

    if (companyId) {
      payload.company_id = companyId
    }

    if (q) {
      payload.username = q
    }
    const data = await this.usecase.findList(payload)
    return c.json(responseSuccess(data))
  }

  findById = async (c: Context<AppEnv>) => {
    const id = c.req.param('id') ?? ''
    const user = c.get('user')
    const companyId = user?.company_id || ''

    const data = await this.usecase.findById(id, companyId)
    if (!data) {
      return c.json(responseError('User not found'), 404)
    }
    return c.json(responseSuccess(data))
  }
}
