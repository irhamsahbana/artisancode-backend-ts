import { Request, Response } from 'express'

import { AuthenticatedRequest } from '@/common/middlewares/auth.middleware'
import { responseError, responseSuccess } from '@/common/rest_response'
import * as Entity from '@/entities/enrollment.entity'
import { withSpan } from '@/telemetry'

import { IEnrollmentUsecase } from './enrollment.contract'

export interface UserContext {
  id: string
  company_id: string
  branch_id?: string
  role_id: string
  name: string
  username: string
}

export default class EnrollmentHandler {
  constructor(private usecase: IEnrollmentUsecase) {}

  create = async (req: Request, res: Response) => {
    return withSpan('enrollment.handler', 'EnrollmentHandler.create', async () => {
      const user = (req as AuthenticatedRequest).user
      const body = req.body
      const payload: Entity.CreateEnrollmentReq = {
        ...body,
        company_id: user?.company_id || '',
        next_billing_date: body.next_payment_date,
        user,
      }

      const data = await this.usecase.create(payload)
      res.status(201).json(responseSuccess(data, 'Enrollment created successfully'))
    })
  }

  update = async (req: Request, res: Response) => {
    return withSpan('enrollment.handler', 'EnrollmentHandler.update', async () => {
      const { id } = req.params
      const user = (req as AuthenticatedRequest).user
      const body = req.body

      const payload: Entity.UpdateEnrollmentReq = {
        ...body,
        id,
        company_id: user?.company_id || '',
        next_billing_date: body.next_payment_date,
        user,
      }

      const data = await this.usecase.update(payload)
      res.status(200).json(responseSuccess(data, 'Enrollment updated successfully'))
    })
  }

  generateInvoice = async (req: Request, res: Response) => {
    return withSpan('enrollment.handler', 'EnrollmentHandler.generateInvoice', async () => {
      const { id } = req.params
      const user = (req as AuthenticatedRequest).user

      const payload: Entity.GenerateEnrollmentInvoiceReq = {
        id,
        company_id: user?.company_id || '',
        user,
      }

      const data = await this.usecase.generateInvoice(payload)
      res.status(201).json(responseSuccess(data, 'Invoice generated successfully'))
    })
  }

  delete = async (req: Request, res: Response) => {
    return withSpan('enrollment.handler', 'EnrollmentHandler.delete', async () => {
      const { id } = req.params
      const user = (req as AuthenticatedRequest).user

      await this.usecase.delete(id, user?.company_id || '')
      res.status(200).json(responseSuccess(null, 'Enrollment deleted successfully'))
    })
  }

  findById = async (req: Request, res: Response) => {
    return withSpan('enrollment.handler', 'EnrollmentHandler.findById', async () => {
      const { id } = req.params
      const user = (req as AuthenticatedRequest).user

      const data = await this.usecase.findById(id, user?.company_id || '')
      if (!data) {
        return res.status(404).json(responseError('Enrollment not found'))
      }
      res.status(200).json(responseSuccess(data))
    })
  }

  findList = async (req: Request, res: Response) => {
    return withSpan('enrollment.handler', 'EnrollmentHandler.findList', async () => {
      const { page, limit, branch_id, student_id, program_id } = req.query as unknown as {
        page: number
        limit: number
        branch_id: string
        student_id: string
        program_id: string
      }
      const user = (req as AuthenticatedRequest).user

      const payload: Entity.GetEnrollmentReq = {
        company_id: user?.company_id || '',
        branch_id,
        student_id,
        program_id,
        pagination: {
          page: Number(page) || 1,
          per_page: Number(limit) || 10,
        },
        user,
      }

      const data = await this.usecase.findList(payload)
      res.status(200).json(responseSuccess(data))
    })
  }
}
