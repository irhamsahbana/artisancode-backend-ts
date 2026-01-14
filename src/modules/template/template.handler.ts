import { Request, Response } from 'express'

import { responseSuccess } from '@/common/rest_response'
import { ITemplateUsecase } from '@/modules/template/template.contract'

export default class TemplateHandler {
  constructor(private readonly usecase: ITemplateUsecase) {}

  getSomething = async (req: Request, res: Response) => {
    const data = await this.usecase.getSomething(req.body)

    return res.status(200).json(responseSuccess(data))
  }
}
