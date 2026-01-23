import { Request, Response } from 'express'

import { AuthenticatedRequest } from '@/common/middlewares/auth.middleware'
import { responseSuccess } from '@/common/rest_response'
import * as Entity from '@/entities/invoice.entity'

import { IInvoiceUsecase } from './invoice.contract'

export default class InvoiceHandler {
  constructor(private usecase: IInvoiceUsecase) {}

  create = async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user
    const body = req.body as Entity.CreateInvoiceReq
    
    const payload: Entity.CreateInvoiceReq = {
      ...body,
      user,
    }

    // Override or set company_id/branch_id from user token
    payload.company_id = user?.company_id || ''
    // branch_id might be in body or from user if restricted.
    // Assuming for now we trust body if user has access, or overwrite if strictly user's branch.
    // Matching previous logic: branch_id: user.branch_id || req.body.branch_id
    if (user?.branch_id) {
      payload.branch_id = user.branch_id
    }

    const result = await this.usecase.create(payload)
    return res.json(responseSuccess(result))
  }

  findById = async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user
    // const payload: Entity.GetInvoiceReq = {
    //   id: req.params.id,
    //   company_id: user?.company_id || '',
    //   user,
    // }
    const result = await this.usecase.findById(req.params.id, user?.company_id || '')
    return res.json(responseSuccess(result))
  }

  findList = async (req: Request, res: Response) => {
    const { page, limit, enrollment_id, status } = req.query as unknown as {
      page: number
      limit: number
      enrollment_id: string
      status: string
    }
    const user = (req as AuthenticatedRequest).user

    const payload: Entity.GetInvoiceReq = {
      company_id: user?.company_id || '',
      enrollment_id,
      status,
      pagination: {
        page: Number(page) || 1,
        per_page: Number(limit) || 10,
      },
      user,
    }

    const result = await this.usecase.findList(payload)
    return res.json(responseSuccess(result))
  }

  generatePaymentLink = async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user
    const result = await this.usecase.generatePaymentLink(req.params.id, user?.company_id || '')
    return res.json(responseSuccess(result))
  }
}
