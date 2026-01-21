import { Request, Response } from 'express'

import { AuthenticatedRequest } from '@/common/middlewares/auth.middleware'
import { responseError, responseSuccess } from '@/common/rest_response'
import * as Entity from '@/entities/program.entity'

import { IProgramUsecase } from './program.contract'

export default class ProgramHandler {
  constructor(private usecase: IProgramUsecase) {}

  create = async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user
    const payload = req.body as Entity.CreateProgramReq
    payload.company_id = user?.company_id || ''

    const data = await this.usecase.create(payload)
    res.status(201).json(responseSuccess(data, 'Program created successfully'))
  }

  update = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = (req as AuthenticatedRequest).user
    const payload = req.body as Entity.UpdateProgramReq

    payload.id = id
    payload.company_id = user?.company_id || ''

    const data = await this.usecase.update(payload)
    res.status(200).json(responseSuccess(data, 'Program updated successfully'))
  }

  delete = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = (req as AuthenticatedRequest).user

    await this.usecase.delete(id, user?.company_id || '')
    res.status(200).json(responseSuccess(null, 'Program deleted successfully'))
  }

  findById = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = (req as AuthenticatedRequest).user

    const data = await this.usecase.findById(id, user?.company_id || '')
    if (!data) {
      return res.status(404).json(responseError('Program not found'))
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

    const payload: Entity.GetProgramReq = {
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

  addSchedule = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = (req as AuthenticatedRequest).user
    const payload = req.body as Entity.AddScheduleReq

    payload.program_id = id
    payload.company_id = user?.company_id || ''

    const data = await this.usecase.addSchedule(payload)
    res.status(201).json(responseSuccess(data, 'Schedule added successfully'))
  }

  addPricing = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = (req as AuthenticatedRequest).user
    const payload = req.body as Entity.AddPricingReq

    payload.program_id = id
    payload.company_id = user?.company_id || ''

    const data = await this.usecase.addPricing(payload)
    res.status(201).json(responseSuccess(data, 'Pricing added successfully'))
  }

  addPrice = async (req: Request, res: Response) => {
    const { id, pricingId } = req.params
    const user = (req as AuthenticatedRequest).user
    const payload = req.body as Entity.AddPriceReq

    payload.program_id = id
    payload.pricing_id = pricingId
    payload.company_id = user?.company_id || ''

    const data = await this.usecase.addPrice(payload)
    res.status(201).json(responseSuccess(data, 'Price added successfully'))
  }

  updatePrice = async (req: Request, res: Response) => {
    const { id, pricingId, priceId } = req.params
    const user = (req as AuthenticatedRequest).user
    const payload = req.body as Entity.UpdatePriceReq

    payload.program_id = id
    payload.pricing_id = pricingId
    payload.price_id = priceId
    payload.company_id = user?.company_id || ''

    const data = await this.usecase.updatePrice(payload)
    res.status(200).json(responseSuccess(data, 'Price updated successfully'))
  }

  deleteSchedule = async (req: Request, res: Response) => {
    const { id, scheduleId } = req.params
    const user = (req as AuthenticatedRequest).user

    await this.usecase.deleteSchedule(id, scheduleId, user?.company_id || '')
    res.status(200).json(responseSuccess(null, 'Schedule deleted successfully'))
  }

  deletePricing = async (req: Request, res: Response) => {
    const { id, pricingId } = req.params
    const user = (req as AuthenticatedRequest).user

    await this.usecase.deletePricing(id, pricingId, user?.company_id || '')
    res.status(200).json(responseSuccess(null, 'Pricing deleted successfully'))
  }
}
