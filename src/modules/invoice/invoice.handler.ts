import { NextFunction, Response } from 'express'

import { IInvoiceUsecase } from './invoice.contract'
import { AuthenticatedRequest, JwtPayload } from '../../common/middlewares/auth.middleware'
import { responseSuccess } from '../../common/rest_response'

export class InvoiceHandler {
  constructor(private usecase: IInvoiceUsecase) {}

  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user as JwtPayload
      const result = await this.usecase.create({
        ...req.body,
        company_id: user.company_id,
        branch_id: user.branch_id || req.body.branch_id,
      })
      return res.json(responseSuccess(result))
    } catch (error) {
      next(error)
    }
  }

  getOne = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user as JwtPayload
      const result = await this.usecase.getOne(req.params.id, user.company_id)
      return res.json(responseSuccess(result))
    } catch (error) {
      next(error)
    }
  }

  getAll = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user as JwtPayload
      const page = req.query.page ? Number(req.query.page) : 1
      const per_page = req.query.per_page ? Number(req.query.per_page) : 10
      const result = await this.usecase.getAll({
        company_id: user.company_id,
        enrollment_id: req.query.enrollment_id as string,
        status: req.query.status as string,
        pagination: { page, per_page },
      })
      return res.json(responseSuccess(result))
    } catch (error) {
      next(error)
    }
  }

  generatePaymentLink = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user as JwtPayload
      const result = await this.usecase.generatePaymentLink(req.params.id, user.company_id)
      return res.json(responseSuccess(result))
    } catch (error) {
      next(error)
    }
  }
}
