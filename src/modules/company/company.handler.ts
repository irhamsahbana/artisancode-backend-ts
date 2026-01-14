import { Request, Response } from 'express'

import { AuthenticatedRequest } from '@/common/middlewares/auth.middleware'
import { responseSuccess } from '@/common/rest_response'
import * as Entity from '@/entities/company.entity'

import { ICompanyUsecase } from './company.contract'

export default class CompanyHandler {
  constructor(private readonly usecase: ICompanyUsecase) {}

  create = async (req: Request, res: Response) => {
    const data = await this.usecase.create(req.body)
    return res.status(201).json(responseSuccess(data, 'Company created successfully'))
  }

  findList = async (req: Request, res: Response) => {
    const { page, limit, q, ids } = req.query as unknown as {
      page: number
      limit: number
      q: string
      ids?: string
    }
    const user = (req as AuthenticatedRequest).user
    const companyId = user?.company_id || ''

    const payload: Entity.GetCompanyReq = {
      id: req.params.id,
      ids: ids ? ids.split(',') : undefined,
      pagination: {
        page,
        per_page: limit,
      },
    }

    if (companyId) {
      payload.accessible_company_id = companyId
    }

    if (q) {
      payload.q = q
    }

    const data = await this.usecase.findList(payload)
    return res.status(200).json(responseSuccess(data))
  }

  findById = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = (req as AuthenticatedRequest).user
    const companyId = user?.company_id || ''

    const payload: Entity.GetCompanyReq = { id }
    if (companyId) {
      payload.accessible_company_id = companyId
    }

    const data = await this.usecase.findById(payload)
    if (!data) {
      return res.status(404).json(responseSuccess(null, 'Company not found'))
    }
    return res.status(200).json(responseSuccess(data))
  }

  update = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = (req as AuthenticatedRequest).user
    const companyId = user?.company_id || ''

    const payload: Entity.UpdateCompanyReq = { ...req.body, id }
    if (companyId) {
      payload.accessible_company_id = companyId
    }

    const data = await this.usecase.update(payload)
    return res.status(200).json(responseSuccess(data, 'Company updated successfully'))
  }

  delete = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = (req as AuthenticatedRequest).user
    const companyId = user?.company_id || ''

    const payload: Entity.GetCompanyReq = { id }
    if (companyId) {
      payload.accessible_company_id = companyId
    }

    await this.usecase.delete(payload)
    return res.status(200).json(responseSuccess(null, 'Company deleted successfully'))
  }
}
