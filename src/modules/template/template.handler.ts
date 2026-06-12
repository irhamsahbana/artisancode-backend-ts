import { Context } from 'hono'

import { responseSuccess } from '@/common/rest_response'
import { AppEnv } from '@/common/types'
import { ITemplateUsecase } from '@/contracts/template.contract'

export default class TemplateHandler {
  constructor(private readonly usecase: ITemplateUsecase) {}

  getSomething = async (c: Context<AppEnv>) => {
    const body = await c.req.json()
    const data = await this.usecase.getSomething(body)
    return c.json(responseSuccess(data))
  }
}
