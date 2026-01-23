import { Request, Response } from 'express'

import { AuthenticatedRequest } from '@/common/middlewares/auth.middleware'
import { responseError, responseSuccess } from '@/common/rest_response'
import * as Entity from '@/entities/user.entity'

import { IUserUsecase } from './user.contract'

export default class UserHandler {
  constructor(private usecase: IUserUsecase) {}

  create = async (req: Request, res: Response) => {
    const payload = req.body as Entity.CreateUserReq
    const user = (req as AuthenticatedRequest).user
    const companyId = user?.company_id || ''

    if (companyId) {
      payload.company_id = companyId
    }
    payload.user = user

    const data = await this.usecase.create(payload)
    res.status(201).json(responseSuccess(data, 'User created successfully'))
  }

  register = async (req: Request, res: Response) => {
    const payload = req.body as Entity.RegisterReq
    const data = await this.usecase.register(payload)
    res.status(201).json(responseSuccess(data, 'Company registered successfully'))
  }

  login = async (req: Request, res: Response) => {
    const payload = req.body as Entity.LoginReq
    const data = await this.usecase.login(payload)
    if (!data) {
      return res.status(401).json(responseError('Invalid credentials'))
    }
    res.status(200).json(responseSuccess(data, 'Login successful'))
  }

  findList = async (req: Request, res: Response) => {
    const { page, limit, q } = req.query as unknown as { page: number; limit: number; q: string }
    const user = (req as AuthenticatedRequest).user
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
      payload.username = q // Search by username using q param
    }
    const data = await this.usecase.findList(payload)
    res.status(200).json(responseSuccess(data))
  }

  findById = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = (req as AuthenticatedRequest).user
    const companyId = user?.company_id || ''

    const data = await this.usecase.findById(id, companyId)
    if (!data) {
      return res.status(404).json(responseError('User not found'))
    }
    res.status(200).json(responseSuccess(data))
  }
}
