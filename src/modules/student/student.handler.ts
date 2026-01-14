import { Request, Response } from 'express'

import { AuthenticatedRequest } from '@/common/middlewares/auth.middleware'
import { responseError, responseSuccess } from '@/common/rest_response'
import * as Entity from '@/entities/student.entity'

import { IStudentUsecase } from './student.contract'

export default class StudentHandler {
  constructor(private usecase: IStudentUsecase) {}

  create = async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user
    const payload = req.body as Entity.CreateStudentReq
    payload.company_id = user?.company_id || ''

    const data = await this.usecase.create(payload)
    res.status(201).json(responseSuccess(data, 'Student created successfully'))
  }

  update = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = (req as AuthenticatedRequest).user
    const payload = req.body as Entity.UpdateStudentReq

    payload.id = id
    payload.company_id = user?.company_id || ''

    const data = await this.usecase.update(payload)
    res.status(200).json(responseSuccess(data, 'Student updated successfully'))
  }

  delete = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = (req as AuthenticatedRequest).user

    await this.usecase.delete(id, user?.company_id || '')
    res.status(200).json(responseSuccess(null, 'Student deleted successfully'))
  }

  findById = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = (req as AuthenticatedRequest).user

    const data = await this.usecase.findById(id, user?.company_id || '')
    if (!data) {
      return res.status(404).json(responseError('Student not found'))
    }
    res.status(200).json(responseSuccess(data))
  }

  findList = async (req: Request, res: Response) => {
    const { page, limit, q, branch_id, age_category_id } = req.query as unknown as {
      page: number
      limit: number
      q: string
      branch_id: string
      age_category_id: string
    }
    const user = (req as AuthenticatedRequest).user

    const payload: Entity.GetStudentReq = {
      company_id: user?.company_id || '',
      q,
      branch_id,
      age_category_id,
      pagination: {
        page: Number(page) || 1,
        per_page: Number(limit) || 10,
      },
    }

    const data = await this.usecase.findList(payload)
    res.status(200).json(responseSuccess(data))
  }
}
