import { Request, Response } from 'express'

import { AuthenticatedRequest } from '@/common/middlewares/auth.middleware'
import { responseError, responseSuccess } from '@/common/rest_response'
import * as Entity from '@/entities/branch.entity'

import { IBranchUsecase } from './branch.contract'

export default class BranchHandler {
  constructor(private usecase: IBranchUsecase) {}

  create = async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user
    const companyId = user?.company_id || ''
    const payload: Entity.CreateBranchReq = {
      ...req.body,
      company_id: companyId,
      user,
    }

    const data = await this.usecase.create(payload)
    res.status(201).json(responseSuccess(data, 'Branch created successfully'))
  }

  update = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = (req as AuthenticatedRequest).user
    const companyId = user?.company_id || ''

    const payload: Entity.UpdateBranchReq = {
      ...req.body,
      id,
      company_id: companyId,
      user,
    }

    const data = await this.usecase.update(payload)
    res.status(200).json(responseSuccess(data, 'Branch updated successfully'))
  }

  delete = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = (req as AuthenticatedRequest).user
    const companyId = user?.company_id || ''

    await this.usecase.delete(id, companyId)
    res.status(200).json(responseSuccess(null, 'Branch deleted successfully'))
  }

  findById = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = (req as AuthenticatedRequest).user
    const companyId = user?.company_id || ''

    const data = await this.usecase.findById(id, companyId)
    if (!data) {
      return res.status(404).json(responseError('Branch not found'))
    }
    res.status(200).json(responseSuccess(data))
  }

  findList = async (req: Request, res: Response) => {
    const { page, limit, q } = req.query as unknown as { page: number; limit: number; q: string }
    const user = (req as AuthenticatedRequest).user
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
    res.status(200).json(responseSuccess(data))
  }
}
