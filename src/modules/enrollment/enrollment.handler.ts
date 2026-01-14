import { Request, Response } from 'express'

import { AuthenticatedRequest } from '@/common/middlewares/auth.middleware'
import { responseError, responseSuccess } from '@/common/rest_response'
import * as Entity from '@/entities/enrollment.entity'

import { IEnrollmentUsecase } from './enrollment.contract'

export default class EnrollmentHandler {
  constructor(private usecase: IEnrollmentUsecase) {}

  create = async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user
    const payload = req.body as Entity.CreateEnrollmentReq
    payload.company_id = user?.company_id || ''

    const data = await this.usecase.create(payload)
    res.status(201).json(responseSuccess(data, 'Enrollment created successfully'))
  }

  update = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = (req as AuthenticatedRequest).user
    const payload = req.body as Entity.UpdateEnrollmentReq

    payload.id = id
    payload.company_id = user?.company_id || ''

    const data = await this.usecase.update(payload)
    res.status(200).json(responseSuccess(data, 'Enrollment updated successfully'))
  }

  delete = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = (req as AuthenticatedRequest).user

    await this.usecase.delete(id, user?.company_id || '')
    res.status(200).json(responseSuccess(null, 'Enrollment deleted successfully'))
  }

  findById = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = (req as AuthenticatedRequest).user

    const data = await this.usecase.findById(id, user?.company_id || '')
    if (!data) {
      return res.status(404).json(responseError('Enrollment not found'))
    }
    res.status(200).json(responseSuccess(data))
  }

  findList = async (req: Request, res: Response) => {
    const { page, limit, branch_id, student_id, program_id, pricing_id } = req.query as unknown as {
      page: number
      limit: number
      branch_id: string
      student_id: string
      program_id: string
      pricing_id: string
    }
    const user = (req as AuthenticatedRequest).user

    const payload: Entity.GetEnrollmentReq = {
      company_id: user?.company_id || '',
      branch_id,
      student_id,
      program_id,
      pricing_id,
      pagination: {
        page: Number(page) || 1,
        per_page: Number(limit) || 10,
      },
    }

    const data = await this.usecase.findList(payload)
    res.status(200).json(responseSuccess(data))
  }
}
