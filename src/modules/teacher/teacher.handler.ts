import { Request, Response } from 'express'

import { AuthenticatedRequest } from '@/common/middlewares/auth.middleware'
import { responseError, responseSuccess } from '@/common/rest_response'
import * as Entity from '@/entities/teacher.entity'

import { ITeacherUsecase } from './teacher.contract'

export default class TeacherHandler {
  constructor(private usecase: ITeacherUsecase) {}

  create = async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user
    const payload = req.body as Entity.CreateTeacherReq
    payload.company_id = user?.company_id || ''

    const data = await this.usecase.create(payload)
    res.status(201).json(responseSuccess(data, 'Teacher created successfully'))
  }

  update = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = (req as AuthenticatedRequest).user
    const payload = req.body as Entity.UpdateTeacherReq

    payload.id = id
    payload.company_id = user?.company_id || ''

    const data = await this.usecase.update(payload)
    res.status(200).json(responseSuccess(data, 'Teacher updated successfully'))
  }

  delete = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = (req as AuthenticatedRequest).user

    await this.usecase.delete(id, user?.company_id || '')
    res.status(200).json(responseSuccess(null, 'Teacher deleted successfully'))
  }

  findById = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = (req as AuthenticatedRequest).user

    const data = await this.usecase.findById(id, user?.company_id || '')
    if (!data) {
      return res.status(404).json(responseError('Teacher not found'))
    }
    res.status(200).json(responseSuccess(data))
  }

  findList = async (req: Request, res: Response) => {
    const { page, limit, q, branch_id } = req.query as unknown as {
      page: number
      limit: number
      q: string
      branch_id: string
    }
    const user = (req as AuthenticatedRequest).user

    const payload: Entity.GetTeacherReq = {
      company_id: user?.company_id || '',
      q,
      branch_id,
      pagination: {
        page: Number(page) || 1,
        per_page: Number(limit) || 10,
      },
    }

    const data = await this.usecase.findList(payload)
    res.status(200).json(responseSuccess(data))
  }
}
