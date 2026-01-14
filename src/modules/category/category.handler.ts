import { Request, Response } from 'express'

import { AuthenticatedRequest } from '@/common/middlewares/auth.middleware'
import { responseError, responseSuccess } from '@/common/rest_response'
import * as Entity from '@/entities/category.entity'

import { ICategoryUsecase } from './category.contract'

export default class CategoryHandler {
  constructor(private usecase: ICategoryUsecase) {}

  create = async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user
    const companyId = user?.company_id || ''
    const payload = req.body as Entity.CreateCategoryReq
    payload.company_id = companyId

    const data = await this.usecase.create(payload)
    res.status(201).json(responseSuccess(data, 'Category created successfully'))
  }

  update = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = (req as AuthenticatedRequest).user
    const companyId = user?.company_id || ''
    const payload = req.body as Entity.UpdateCategoryReq

    payload.id = id
    payload.company_id = companyId

    const data = await this.usecase.update(payload)
    res.status(200).json(responseSuccess(data, 'Category updated successfully'))
  }

  delete = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = (req as AuthenticatedRequest).user
    const companyId = user?.company_id || ''

    await this.usecase.delete(id, companyId)
    res.status(200).json(responseSuccess(null, 'Category deleted successfully'))
  }

  findById = async (req: Request, res: Response) => {
    const { id } = req.params
    const user = (req as AuthenticatedRequest).user
    const companyId = user?.company_id || ''

    const data = await this.usecase.findById(id, companyId)
    if (!data) {
      return res.status(404).json(responseError('Category not found'))
    }
    res.status(200).json(responseSuccess(data))
  }

  findList = async (req: Request, res: Response) => {
    const { page, limit, q, group } = req.query as unknown as {
      page: number
      limit: number
      q: string
      group: string
    }
    const user = (req as AuthenticatedRequest).user
    const companyId = user?.company_id || ''

    const payload: Entity.GetCategoryReq = {
      company_id: companyId,
      q,
      group,
      pagination: {
        page: Number(page) || 1,
        per_page: Number(limit) || 10,
      },
    }

    const data = await this.usecase.findList(payload)
    res.status(200).json(responseSuccess(data))
  }
}
