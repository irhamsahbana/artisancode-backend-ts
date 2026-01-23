import { NextFunction, Request, Response } from 'express'

import { AuthenticatedRequest } from '@/common/middlewares/auth.middleware'
import { responseError, responseSuccess } from '@/common/rest_response'
import * as Entity from '@/entities/role.entity'

import { IRoleAndPermissionUsecase } from './role_and_permission.contract'

export default class RoleAndPermissionHandler {
  constructor(private usecase: IRoleAndPermissionUsecase) {}

  // Role Handlers
  createRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.body as Entity.CreateRoleReq
      const user = (req as AuthenticatedRequest).user
      const companyId = user?.company_id || ''

      if (companyId) {
        payload.company_id = companyId
      }
      payload.user = user

      const data = await this.usecase.createRole(payload)
      res.status(201).json(responseSuccess(data, 'Role created successfully'))
    } catch (error) {
      next(error)
    }
  }

  findRoleList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, q, ids } = req.query as unknown as {
        page: number
        limit: number
        q: string
        ids: string
      }
      const user = (req as AuthenticatedRequest).user
      const companyId = user?.company_id || ''

      const payload: Entity.GetRoleReq = {
        q,
        ids: ids ? ids.split(',') : undefined,
        pagination: {
          page: Number(page) || 1,
          per_page: Number(limit) || 10,
        },
        user,
      }

      if (companyId) {
        payload.company_id = companyId
      }

      const data = await this.usecase.findRoleList(payload)
      res.status(200).json(responseSuccess(data))
    } catch (error) {
      next(error)
    }
  }

  findRoleById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const user = (req as AuthenticatedRequest).user
      const companyId = user?.company_id || ''

      const data = await this.usecase.findRoleById(id, companyId)
      if (!data) {
        return res.status(404).json(responseError('Role not found'))
      }
      res.status(200).json(responseSuccess(data))
    } catch (error) {
      next(error)
    }
  }

  updateRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const user = (req as AuthenticatedRequest).user
      const companyId = user?.company_id || ''

      const payload = { ...req.body, id } as Entity.UpdateRoleReq
      payload.user = user

      if (companyId) {
        payload.company_id = companyId
      }

      const data = await this.usecase.updateRole(payload)
      res.status(200).json(responseSuccess(data, 'Role updated successfully'))
    } catch (error) {
      next(error)
    }
  }

  deleteRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const user = (req as AuthenticatedRequest).user
      const companyId = user?.company_id || ''

      await this.usecase.deleteRole(id, companyId)
      res.status(200).json(responseSuccess(null, 'Role deleted successfully'))
    } catch (error) {
      next(error)
    }
  }

  // Permission Handlers
  findPermissionList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, q } = req.query as unknown as { page: number; limit: number; q: string }
      const payload: Entity.GetPermissionReq = {
        q,
        pagination: {
          page: Number(page) || 1,
          per_page: Number(limit) || 10,
        },
      }
      const data = await this.usecase.findPermissionList(payload)
      res.status(200).json(responseSuccess(data))
    } catch (error) {
      next(error)
    }
  }
}
